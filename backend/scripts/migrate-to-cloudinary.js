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

    for (const [filename, newUrl] of urlMap.entries()) {
      if (prod.image && prod.image.includes(filename)) {
        prod.image = newUrl;
        changed = true;
      }
      if (Array.isArray(prod.images)) {
        prod.images = prod.images.map((img) =>
          img && img.includes(filename) ? newUrl : img
        );
        changed = true;
      }
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

    for (const [filename, newUrl] of urlMap.entries()) {
      if (brand.logoUrl && brand.logoUrl.includes(filename)) {
        brand.logoUrl = newUrl;
        changed = true;
      }
      if (brand.image && brand.image.includes(filename)) {
        brand.image = newUrl;
        changed = true;
      }
      if (Array.isArray(brand.images)) {
        brand.images = brand.images.map((img) =>
          img && img.includes(filename) ? newUrl : img
        );
        changed = true;
      }
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
    let changed = false;

    for (const [filename, newUrl] of urlMap.entries()) {
      if (blog.coverImage && blog.coverImage.includes(filename)) {
        blog.coverImage = newUrl;
        changed = true;
      }
    }

    if (changed) {
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
