const crypto = require("node:crypto");
const path = require("node:path");
const multer = require("multer");
const mongoose = require("mongoose");
const StoreSetting = require("../models/StoreSetting");
const config = require("../config");
const {
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
  testConnection,
} = require("../services/cloudinary");

const storage = multer.memoryStorage();
const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif|svg\+xml|avif/;
  if (
    allowed.test(file.mimetype) ||
    /\.(jpe?g|png|webp|gif|svg|avif)$/i.test(file.originalname)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only image files (JPG, PNG, WebP, GIF, SVG, AVIF) are allowed.",
      ),
    );
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

function registerAdminSettingsRoutes({
  router,
  asyncHandler,
  Category,
}) {
  router.get(
    "/settings/return-exchange",
    asyncHandler(async (_req, res) => {
      const setting = await StoreSetting.findOne({ key: "returnExchangeEnabled" }).lean();
      res.json({ enabled: setting?.value !== false });
    }),
  );

  router.put(
    "/settings/return-exchange",
    asyncHandler(async (req, res) => {
      if (typeof req.body?.enabled !== "boolean") return res.status(400).json({ error: "Choose whether return and exchange requests are enabled." });
      const setting = await StoreSetting.findOneAndUpdate(
        { key: "returnExchangeEnabled" },
        { $set: { value: req.body.enabled } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ).lean();
      res.json({ enabled: setting.value });
    }),
  );

  router.get(
    "/settings/featured-categories",
    asyncHandler(async (_req, res) => {
      const parents = await Category.find({ isActive: true, isParent: true }).sort({ name: 1 }).select("_id name slug description").lean();
      const setting = await StoreSetting.findOne({ key: "featuredParentCategories" }).lean();
      const savedIds = Array.isArray(setting?.value) ? setting.value.map(String) : [];
      const availableIds = new Set(parents.map((category) => String(category._id)));
      const selectedIds = savedIds.filter((id) => availableIds.has(id));
      res.json({
        categories: parents,
        selectedIds: selectedIds.length ? selectedIds : parents.slice(0, 4).map((category) => String(category._id)),
      });
    }),
  );

  router.put(
    "/settings/featured-categories",
    asyncHandler(async (req, res) => {
      const ids = Array.isArray(req.body?.categoryIds) ? [...new Set(req.body.categoryIds.map(String))] : null;
      if (!ids || ids.length > 4 || ids.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
        return res.status(400).json({ error: "Select four valid parent categories." });
      }
      const [categories, activeParentCount] = await Promise.all([
        ids.length ? Category.find({ _id: { $in: ids }, isActive: true, isParent: true }).select("_id").lean() : [],
        Category.countDocuments({ isActive: true, isParent: true }),
      ]);
      if (categories.length !== ids.length || ids.length !== Math.min(4, activeParentCount)) {
        return res.status(400).json({ error: "Only active parent categories can be featured." });
      }
      await StoreSetting.findOneAndUpdate(
        { key: "featuredParentCategories" },
        { $set: { value: ids } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      res.json({ selectedIds: ids });
    }),
  );

  router.get(
    "/settings/announcements",
    asyncHandler(async (_req, res) => {
      const setting = await StoreSetting.findOne({ key: "announcements" }).lean();
      res.json({ announcements: Array.isArray(setting?.value) ? setting.value : [] });
    }),
  );

  router.put(
    "/settings/announcements",
    asyncHandler(async (req, res) => {
      const announcements = Array.isArray(req.body?.announcements)
        ? req.body.announcements.map((value) => String(value || "").trim()).filter(Boolean)
        : null;
      if (!announcements || announcements.length > 12 || announcements.some((item) => item.length > 180)) {
        return res.status(400).json({ error: "Add up to 12 announcements, each no longer than 180 characters." });
      }
      const setting = await StoreSetting.findOneAndUpdate(
        { key: "announcements" },
        { $set: { value: announcements } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ).lean();
      res.json({ announcements: setting.value });
    }),
  );

  router.post(
    "/upload",
    (req, res, next) => {
      upload.any()(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ error: `Upload error: ${err.message}` });
        } else if (err) {
          return res.status(400).json({ error: err.message });
        }
        next();
      });
    },
    asyncHandler(async (req, res) => {
      const files = req.files || [];
      if (!files.length) {
        return res.status(400).json({ error: "No image files provided." });
      }

      if (!isCloudinaryConfigured()) {
        return res.status(400).json({
          error:
            "Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env to store images securely.",
        });
      }

      const folder = config.cloudinaryFolder;
      const usedNames = new Map();

      const uploadPromises = files.map((file) => {
        const ext = path.extname(file.originalname || "");
        const rawBase = path.basename(file.originalname || "image", ext).trim();
        const safeBase = rawBase
          .replace(/\s+/g, "-")
          .replace(/[^a-zA-Z0-9_-]/g, "_")
          .replace(/[-_]+/g, (m) => m[0])
          .replace(/^[-_]+|[-_]+$/g, "") || "image";

        let publicId = safeBase;
        const count = usedNames.get(safeBase) || 0;
        if (count > 0) {
          publicId = `${safeBase}-${count + 1}`;
        }
        usedNames.set(safeBase, count + 1);

        return uploadBufferToCloudinary(file.buffer, {
          public_id: publicId,
          folder,
          use_filename: true,
          unique_filename: false,
          overwrite: true,
          filename_override: file.originalname,
        });
      });

      const results = await Promise.all(uploadPromises);
      const urls = results.map((r) => r.secure_url);

      res.json({
        success: true,
        urls,
        url: urls[0],
        count: urls.length,
        provider: "cloudinary",
        images: results.map((r) => ({
          url: r.secure_url,
          publicId: r.public_id,
          format: r.format,
          width: r.width,
          height: r.height,
          bytes: r.bytes,
        })),
      });
    }),
  );

  router.delete(
    "/upload",
    asyncHandler(async (req, res) => {
      const { publicId, url } = req.body || {};
      const targetId = publicId || (url ? extractPublicId(url) : null);
      if (!targetId) {
        return res
          .status(400)
          .json({ error: "publicId or url is required to delete an image." });
      }
      const result = await deleteFromCloudinary(targetId);
      res.json({ success: true, result });
    }),
  );

  router.get(
    "/cloudinary-status",
    asyncHandler(async (_req, res) => {
      const configured = isCloudinaryConfigured();
      if (!configured) {
        return res.json({
          configured: false,
          cloudName: config.cloudinaryCloudName,
          message: "Cloudinary credentials are not configured in backend/.env",
        });
      }
      try {
        await testConnection();
        res.json({
          configured: true,
          connected: true,
          cloudName: config.cloudinaryCloudName,
          folder: config.cloudinaryFolder,
          message: "Cloudinary credentials are valid and connection is active.",
        });
      } catch (err) {
        res.status(502).json({
          configured: true,
          connected: false,
          error: err.message,
          message:
            "Could not authenticate with Cloudinary. Please verify your credentials.",
        });
      }
    }),
  );

}

module.exports = registerAdminSettingsRoutes;
