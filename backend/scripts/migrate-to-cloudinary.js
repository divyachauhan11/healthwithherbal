require("dotenv").config();
const path = require("node:path");
const fs = require("node:fs");
const mongoose = require("mongoose");
const {
  isCloudinaryConfigured,
  uploadFilePathToCloudinary,
} = require("../src/services/cloudinary");
const Product = require("../src/models/Product");
const Brand = require("../src/models/Brand");
const BlogPost = require("../src/models/BlogPost");

function replaceLocalUploadUrl(value, urlMap) {
  let result = value;
  for (const [filename, newUrl] of urlMap) {
    if (result && result.includes(filename)) result = newUrl;
  }
  return result;
}

function replaceLocalUploadUrls(values, urlMap) {
  if (!Array.isArray(values)) return { values, changed: false };
  const updatedValues = values.map((value) =>
    replaceLocalUploadUrl(value, urlMap),
  );
  return {
    values: updatedValues,
    changed: updatedValues.some((value, index) => value !== values[index]),
  };
}

async function migrate() {
  console.log("==================================================");
  console.log("  Health with Herbal - Cloudinary Migration Tool  ");
  console.log("==================================================");

  if (!isCloudinaryConfigured()) {
    console.error("❌ Cloudinary is not configured. Please add valid credentials in backend/.env first.");
    process.exit(1);
  }

  const uploadsDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadsDir)) {
    console.log("ℹ️ No local uploads directory found. Nothing to migrate.");
    process.exit(0);
  }

  const files = fs.readdirSync(uploadsDir).filter((f) => {
    return fs.statSync(path.join(uploadsDir, f)).isFile() && !f.startsWith(".");
  });

  if (!files.length) {
    console.log("ℹ️ Local uploads folder is empty. Nothing to migrate.");
    process.exit(0);
  }

  console.log(`📁 Found ${files.length} local files in backend/uploads/.`);
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ MongoDB connected.");

  const urlMap = new Map(); // filename -> secure_url

  console.log("\nUploading local files to Cloudinary...");
  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.join(uploadsDir, filename);

    try {
      const ext = path.extname(filename);
      const safeBase = path.basename(filename, ext).slice(0, 40);
      const res = await uploadFilePathToCloudinary(filePath, {
        public_id: safeBase,
        folder: process.env.CLOUDINARY_FOLDER || "healthwithherbal",
      });

      urlMap.set(filename, res.secure_url);
      console.log(`  [${i + 1}/${files.length}] Uploaded: ${filename} -> ${res.secure_url}`);
    } catch (err) {
      console.error(`  ❌ Failed to upload ${filename}:`, err.message);
    }
  }

  console.log(`\n✅ Upload complete. Migrated ${urlMap.size} files to Cloudinary.`);
  console.log("Updating database records with new Cloudinary URLs...");

  let updatedProducts = 0;
  let updatedBrands = 0;
  let updatedBlogs = 0;

  // Update Products
  const products = await Product.find({
    $or: [
      { image: { $regex: "/uploads/" } },
      { images: { $elemMatch: { $regex: "/uploads/" } } },
    ],
  });

  for (const prod of products) {
    let changed = false;

    const image = replaceLocalUploadUrl(prod.image, urlMap);
    if (image !== prod.image) {
      prod.image = image;
      changed = true;
    }

    const images = replaceLocalUploadUrls(prod.images, urlMap);
    if (images.changed) {
      prod.images = images.values;
      changed = true;
    }

    if (changed) {
      await prod.save();
      updatedProducts++;
    }
  }

  // Update Brands
  const brands = await Brand.find({
    $or: [
      { logoUrl: { $regex: "/uploads/" } },
      { image: { $regex: "/uploads/" } },
      { images: { $elemMatch: { $regex: "/uploads/" } } },
    ],
  });

  for (const brand of brands) {
    let changed = false;

    const logoUrl = replaceLocalUploadUrl(brand.logoUrl, urlMap);
    if (logoUrl !== brand.logoUrl) {
      brand.logoUrl = logoUrl;
      changed = true;
    }

    const image = replaceLocalUploadUrl(brand.image, urlMap);
    if (image !== brand.image) {
      brand.image = image;
      changed = true;
    }

    const images = replaceLocalUploadUrls(brand.images, urlMap);
    if (images.changed) {
      brand.images = images.values;
      changed = true;
    }

    if (changed) {
      await brand.save();
      updatedBrands++;
    }
  }

  // Update Blog posts
  const blogs = await BlogPost.find({
    coverImage: { $regex: "/uploads/" },
  });

  for (const blog of blogs) {
    const coverImage = replaceLocalUploadUrl(blog.coverImage, urlMap);
    if (coverImage !== blog.coverImage) {
      blog.coverImage = coverImage;
      await blog.save();
      updatedBlogs++;
    }
  }

  console.log("\n==================================================");
  console.log("🎉 Migration Summary:");
  console.log(`   - Uploaded to Cloudinary: ${urlMap.size} images`);
  console.log(`   - Products updated:       ${updatedProducts}`);
  console.log(`   - Brands updated:         ${updatedBrands}`);
  console.log(`   - Blog posts updated:     ${updatedBlogs}`);
  console.log("==================================================");

  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
