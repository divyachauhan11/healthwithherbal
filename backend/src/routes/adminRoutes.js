const crypto = require("node:crypto");
const path = require("node:path");
const fs = require("node:fs");
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { z } = require("zod");
const asyncHandler = require("../middleware/asyncHandler");
const {
  createAdminToken,
  requireAdmin,
  safeEqual,
} = require("../middleware/adminAuth");
const Product = require("../models/Product");
const ProductCategory = require("../models/ProductCategory");
const InventoryLog = require("../models/InventoryLog");
const Order = require("../models/Order");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const Coupon = require("../models/Coupon");
const ProductReview = require("../models/ProductReview");
const BlogPost = require("../models/BlogPost");
const User = require("../models/User");
const StoreSetting = require("../models/StoreSetting");
const { syncProductRating } = require("../utils/syncRatings");

const {
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
  testConnection,
} = require("../services/cloudinary");

const router = express.Router();

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

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
});
const productSchema = z.object({
  title: z.string().trim().min(2).max(180),
  sku: z.string().trim().min(2).max(80),
  brand: z.string().trim().min(1).max(100),
  category: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(5000),
  original: z.coerce.number().min(0),
  price: z.coerce.number().min(0),
  stockQty: z.coerce.number().int().min(0),
  image: z.string().optional().default(""),
  images: z.array(z.string()).optional().default([]),
  badge: z.string().trim().max(80).optional().nullable(),
  active: z.coerce.boolean().optional(),
});
const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(120),
  type: z.string().optional().default("concern"),
  isActive: z.coerce.boolean().optional(),
});
const brandSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(120),
  description: z.string().max(1000).optional().default(""),
  logoUrl: z.string().optional().default(""),
  image: z.string().optional().default(""),
  images: z.array(z.string()).optional().default([]),
  isActive: z.coerce.boolean().optional().default(true),
});
const couponSchema = z.object({
  code: z.string().trim().min(3).max(40),
  description: z.string().max(500).optional().default(""),
  discountType: z.enum(["percent", "fixed", "free_shipping"]),
  discountValue: z.coerce.number().min(0),
  minOrderAmount: z.coerce.number().min(0).optional().default(0),
  usageLimit: z.coerce.number().int().min(1).optional(),
  expiresAt: z.coerce.date().optional(),
  isActive: z.coerce.boolean().optional().default(true),
});
const orderStatusSchema = z.object({
  status: z.enum(["placed", "processing", "shipped", "delivered", "cancelled"]),
});
const blogSchema = z.object({
  title: z.string().trim().min(4).max(180),
  slug: z.string().trim().min(2).max(120),
  author: z.string().trim().min(2).max(100),
  readTime: z.string().trim().min(2).max(30),
  category: z.string().trim().min(2).max(60).optional(),
  excerpt: z.string().max(500).optional().default(""),
  content: z.string().min(20).max(50000),
  coverImage: z.string().url().or(z.literal("")).optional(),
  tags: z.array(z.string().trim().max(40)).max(12).optional().default([]),
  status: z.enum(["draft", "published"]).optional().default("draft"),
  allowComments: z.coerce.boolean().optional().default(true),
});
const slugify = (value) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const validId = (id) => mongoose.isValidObjectId(id);
const invalid = (res, parsed) =>
  res
    .status(400)
    .json({
      error: "Please check the submitted fields.",
      details: parsed.error.flatten().fieldErrors,
    });

router.post(
  "/auth/login",
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return invalid(res, parsed);
    const email = process.env.ADMIN_EMAIL || "";
    const password = process.env.ADMIN_PASSWORD || "";
    const secret = process.env.ADMIN_SESSION_SECRET || "";
    if (!email || !password || secret.length < 32)
      return res
        .status(503)
        .json({
          error:
            "Set ADMIN_EMAIL, ADMIN_PASSWORD and an ADMIN_SESSION_SECRET of at least 32 characters in the backend environment first.",
        });
    if (
      !safeEqual(parsed.data.email.toLowerCase(), email.toLowerCase()) ||
      !safeEqual(parsed.data.password, password)
    )
      return res.status(401).json({ error: "Email or password is incorrect." });
    await User.updateOne(
      { email: email.toLowerCase() },
      {
        $setOnInsert: {
          name: "Store administrator",
          email: email.toLowerCase(),
          role: "admin",
          isActive: true,
          passwordHash: crypto.randomBytes(32).toString("hex"),
        },
      },
      { upsert: true },
    );
    res.json({
      token: createAdminToken(email.toLowerCase(), secret),
      user: {
        name: "Store administrator",
        email: email.toLowerCase(),
        role: "admin",
      },
    });
  }),
);

router.use(requireAdmin);

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

    const folder = process.env.CLOUDINARY_FOLDER || "healthwithherbal";

    const uploadPromises = files.map((file) => {
      const ext = path.extname(file.originalname || "").toLowerCase();
      const safeBase = path
        .basename(file.originalname || "image", ext)
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 30);
      const publicId = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${safeBase}`;

      return uploadBufferToCloudinary(file.buffer, {
        public_id: publicId,
        folder,
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
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
        message: "Cloudinary credentials are not configured in backend/.env",
      });
    }
    try {
      await testConnection();
      res.json({
        configured: true,
        connected: true,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        folder: process.env.CLOUDINARY_FOLDER || "healthwithherbal",
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

router.get(
  "/dashboard",
  asyncHandler(async (_req, res) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const getSalesByCategory = (matchStage) =>
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" }, ...matchStage } },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            let: { prodId: "$items.product", legId: "$items.legacyId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ["$_id", "$$prodId"] },
                      { $eq: ["$legacyId", "$$legId"] },
                    ],
                  },
                },
              },
              { $project: { category: 1 } },
              { $limit: 1 },
            ],
            as: "productDoc",
          },
        },
        { $unwind: { path: "$productDoc", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: { $ifNull: ["$productDoc.category", "Other"] },
            revenue: { $sum: { $ifNull: ["$items.lineTotal", 0] } },
            units: { $sum: { $ifNull: ["$items.quantity", 1] } },
          },
        },
        { $sort: { revenue: -1 } },
      ]);

    const lowStockFilter = {
      active: true,
      $or: [
        { stockQty: { $lte: 0 } },
        {
          $expr: {
            $lte: ["$stockQty", { $ifNull: ["$lowStockThreshold", 10] }],
          },
        },
      ],
    };

    const [
      productCount,
      activeProducts,
      lowStock,
      orderCount,
      pendingOrders,
      revenue,
      monthRevenueRows,
      customerRows,
      reviewCount,
      pendingReviews,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ active: true }),
      Product.countDocuments(lowStockFilter),
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ["placed", "processing"] } }),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            status: { $ne: "cancelled" },
            createdAt: { $gte: startOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.distinct("customer.email"),
      ProductReview.countDocuments(),
      ProductReview.countDocuments({ isApproved: false }),
    ]);
    const [
      dailyRevenue,
      recentOrders,
      lowStockProducts,
      salesByCategory,
      monthSalesByCategory,
      catalogCategories,
    ] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            status: { $ne: "cancelled" },
            createdAt: { $gte: new Date(Date.now() - 7 * 86400000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(6).lean(),
      Product.find(lowStockFilter).sort({ stockQty: 1, title: 1 }).lean(),
      getSalesByCategory({}),
      getSalesByCategory({ createdAt: { $gte: startOfMonth } }),
      Product.aggregate([
        { $match: { active: true } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);
    res.json({
      stats: {
        productCount,
        activeProducts,
        lowStock,
        orderCount,
        pendingOrders,
        revenue: revenue[0]?.total || 0,
        monthRevenue: monthRevenueRows[0]?.total || 0,
        currency: "INR",
        customerCount: customerRows.length,
        reviewCount,
        pendingReviews,
      },
      dailyRevenue,
      recentOrders,
      lowStockProducts,
      salesByCategory,
      monthSalesByCategory,
      catalogCategories,
    });
  }),
);

router.get(
  "/products",
  asyncHandler(async (req, res) => {
    const q = String(req.query.q || "").slice(0, 100);
    const filter = q
      ? {
          $or: [
            {
              title: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
            },
            { sku: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
          ],
        }
      : {};
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();
    res.json({ items: products, total: await Product.countDocuments(filter) });
  }),
);

router.get(
  "/low-stock",
  asyncHandler(async (req, res) => {
    const q = String(req.query.q || "").slice(0, 100);
    const filter = {
      active: true,
      $or: [
        { stockQty: { $lt: 10 } },
        { $expr: { $lte: ["$stockQty", "$lowStockThreshold"] } },
      ],
    };
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$and = [
        {
          $or: [
            { title: regex },
            { sku: regex },
            { category: regex },
            { brand: regex },
          ],
        },
      ];
    }
    const products = await Product.find(filter)
      .sort({ stockQty: 1, title: 1 })
      .limit(500)
      .lean();
    res.json({ items: products, total: products.length });
  }),
);

router.patch(
  "/products/:id/stock",
  asyncHandler(async (req, res) => {
    if (!validId(req.params.id))
      return res.status(400).json({ error: "Invalid product ID." });
    const stockQty = Number(req.body.stockQty);
    if (isNaN(stockQty) || stockQty < 0)
      return res
        .status(400)
        .json({ error: "Stock quantity must be a non-negative number." });
    const before = await Product.findById(req.params.id)
      .select("stockQty")
      .lean();
    if (!before) return res.status(404).json({ error: "Product not found." });
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stockQty },
      { new: true },
    );
    await InventoryLog.create({
      productId: product._id,
      type: stockQty > before.stockQty ? "restock" : "adjustment",
      quantityChange: stockQty - before.stockQty,
      stockBefore: before.stockQty,
      stockAfter: stockQty,
      reason: req.body.reason || "Admin low stock page quick restock",
    });
    res.json({ item: product });
  }),
);

router.patch(
  "/products/:id/badge",
  asyncHandler(async (req, res) => {
    if (!validId(req.params.id))
      return res.status(400).json({ error: "Invalid product ID." });
    const { badge } = req.body || {};
    const cleanBadge = typeof badge === "string" && badge.trim() ? badge.trim() : null;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { badge: cleanBadge },
      { new: true },
    );
    if (!product) return res.status(404).json({ error: "Product not found." });
    res.json({ item: product });
  }),
);
router.post(
  "/products",
  asyncHandler(async (req, res) => {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) return invalid(res, parsed);
    const legacyId =
      (await Product.findOne().sort({ legacyId: -1 }).select("legacyId").lean())
        ?.legacyId || 0;
    const data = parsed.data;
    const images =
      Array.isArray(data.images) && data.images.length > 0
        ? data.images
        : data.image
          ? [data.image]
          : [];
    const primaryImage =
      images[0] ||
      data.image ||
      "https://placehold.co/600x600?text=Herbal+Product";
    const [brand, category] = await Promise.all([
      Brand.findOne({ name: data.brand }).select("_id").lean(),
      Category.findOne({ name: data.category }).select("_id").lean(),
    ]);
    const product = await Product.create({
      ...data,
      badge: data.badge ? data.badge.trim() : null,
      image: primaryImage,
      images: images.length ? images : [primaryImage],
      brandId: brand?._id,
      legacyId: legacyId + 1,
      slug: `${slugify(data.title)}-${legacyId + 1}`,
      original: data.original ?? data.price,
      rating: 0,
      reviews: 0,
    });
    if (category)
      await ProductCategory.create({
        productId: product._id,
        categoryId: category._id,
      });
    res.status(201).json({ item: product });
  }),
);
router.put(
  "/products/:id",
  asyncHandler(async (req, res) => {
    if (!validId(req.params.id))
      return res.status(400).json({ error: "Invalid product ID." });
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) return invalid(res, parsed);
    const data = parsed.data;
    const images =
      Array.isArray(data.images) && data.images.length > 0
        ? data.images
        : data.image
          ? [data.image]
          : [];
    const primaryImage = images[0] || data.image || "";
    const [brand, category, existing] = await Promise.all([
      Brand.findOne({ name: data.brand }).select("_id").lean(),
      Category.findOne({ name: data.category }).select("_id").lean(),
      Product.findById(req.params.id).select("_id").lean(),
    ]);
    if (!existing) return res.status(404).json({ error: "Product not found." });
    const before = await Product.findById(req.params.id)
      .select("stockQty")
      .lean();
    const updateData = {
      ...data,
      badge: data.badge !== undefined ? (data.badge ? data.badge.trim() : null) : undefined,
      brandId: brand?._id,
    };
    if (updateData.badge === undefined) delete updateData.badge;
    if (primaryImage) updateData.image = primaryImage;
    if (images.length) updateData.images = images;
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ error: "Product not found." });
    if (before.stockQty !== product.stockQty)
      await InventoryLog.create({
        productId: product._id,
        type: product.stockQty > before.stockQty ? "restock" : "adjustment",
        quantityChange: product.stockQty - before.stockQty,
        stockBefore: before.stockQty,
        stockAfter: product.stockQty,
        reason: "Admin inventory update",
      });
    await ProductCategory.deleteMany({ productId: product._id });
    if (category)
      await ProductCategory.create({
        productId: product._id,
        categoryId: category._id,
      });
    res.json({ item: product });
  }),
);
router.delete(
  "/products/:id",
  asyncHandler(async (req, res) => {
    if (!validId(req.params.id))
      return res.status(400).json({ error: "Invalid product ID." });
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found." });
    await ProductCategory.deleteMany({ productId: req.params.id });
    res.json({ item: product, success: true, message: "Product deleted permanently." });
  }),
);

router.patch(
  "/products/:id/toggle-active",
  asyncHandler(async (req, res) => {
    if (!validId(req.params.id))
      return res.status(400).json({ error: "Invalid product ID." });
    const current = await Product.findById(req.params.id);
    if (!current) return res.status(404).json({ error: "Product not found." });
    const nextActive =
      typeof req.body?.active === "boolean"
        ? req.body.active
        : !current.active;
    current.active = nextActive;
    await current.save();
    res.json({ item: current, success: true });
  }),
);

router.patch(
  "/products/:id",
  asyncHandler(async (req, res) => {
    if (!validId(req.params.id))
      return res.status(400).json({ error: "Invalid product ID." });
    const update = {};
    if (typeof req.body?.active === "boolean") {
      update.active = req.body.active;
    }
    if (req.body?.stockQty !== undefined) {
      update.stockQty = Number(req.body.stockQty);
    }
    const product = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!product) return res.status(404).json({ error: "Product not found." });
    res.json({ item: product, success: true });
  }),
);


router.get(
  "/orders",
  asyncHandler(async (_req, res) =>
    res.json({
      items: await Order.find().sort({ createdAt: -1 }).limit(500).lean(),
    }),
  ),
);
router.patch(
  "/orders/:id",
  asyncHandler(async (req, res) => {
    if (!validId(req.params.id))
      return res.status(400).json({ error: "Invalid order ID." });
    const parsed = orderStatusSchema.safeParse(req.body);
    if (!parsed.success) return invalid(res, parsed);
    const item = await Order.findByIdAndUpdate(
      req.params.id,
      { status: parsed.data.status },
      { new: true, runValidators: true },
    );
    if (!item) return res.status(404).json({ error: "Order not found." });
    res.json({ item });
  }),
);

function collectionRoutes(path, Model, schema, extra = {}) {
  router.get(
    `/${path}`,
    asyncHandler(async (_req, res) => {
      const items = await Model.find()
        .sort({ createdAt: -1 })
        .limit(500)
        .lean();
      if (path === "categories") {
        const [pcCounts, nameCounts] = await Promise.all([
          ProductCategory.aggregate([
            { $group: { _id: "$categoryId", count: { $sum: 1 } } },
          ]),
          Product.aggregate([
            { $group: { _id: { $toLower: "$category" }, count: { $sum: 1 } } },
          ]),
        ]);
        const pcMap = new Map(pcCounts.map((c) => [String(c._id), c.count]));
        const nameMap = new Map(
          nameCounts.map((c) => [c._id ? String(c._id).trim() : "", c.count]),
        );

        items.forEach((item) => {
          const byId = pcMap.get(String(item._id)) || 0;
          const byName = nameMap.get(item.name?.toLowerCase().trim()) || 0;
          item.productCount = Math.max(byId, byName);
          item.count = item.productCount;
        });
      } else if (path === "brands") {
        const [brandIdCounts, nameCounts] = await Promise.all([
          Product.aggregate([
            { $group: { _id: "$brandId", count: { $sum: 1 } } },
          ]),
          Product.aggregate([
            { $group: { _id: { $toLower: "$brand" }, count: { $sum: 1 } } },
          ]),
        ]);
        const idMap = new Map(
          brandIdCounts.map((b) => [String(b._id), b.count]),
        );
        const nameMap = new Map(
          nameCounts.map((b) => [b._id ? String(b._id).trim() : "", b.count]),
        );

        items.forEach((item) => {
          const byId = idMap.get(String(item._id)) || 0;
          const byName = nameMap.get(item.name?.toLowerCase().trim()) || 0;
          item.productCount = Math.max(byId, byName);
          item.count = item.productCount;
        });
      }
      res.json({ items });
    }),
  );
  router.post(
    `/${path}`,
    asyncHandler(async (req, res) => {
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return invalid(res, parsed);
      const data = { ...parsed.data };
      if (data.name && !data.slug) data.slug = slugify(data.name);
      if (data.code) data.code = data.code.toUpperCase();
      if (path === "brands") {
        const images =
          Array.isArray(data.images) && data.images.length > 0
            ? data.images
            : data.image
              ? [data.image]
              : data.logoUrl
                ? [data.logoUrl]
                : [];
        const primary = images[0] || data.image || data.logoUrl || "";
        data.image = primary;
        data.logoUrl = primary;
        data.images = images.length ? images : primary ? [primary] : [];
      }
      const item = await Model.create({ ...extra.create, ...data });
      res.status(201).json({ item });
    }),
  );
  router.put(
    `/${path}/:id`,
    asyncHandler(async (req, res) => {
      if (!validId(req.params.id))
        return res
          .status(400)
          .json({ error: `Invalid ${path.slice(0, -1)} ID.` });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return invalid(res, parsed);
      const data = { ...parsed.data };
      if (path === "brands") {
        const images =
          Array.isArray(data.images) && data.images.length > 0
            ? data.images
            : data.image
              ? [data.image]
              : data.logoUrl
                ? [data.logoUrl]
                : [];
        const primary = images[0] || data.image || data.logoUrl || "";
        data.image = primary;
        data.logoUrl = primary;
        data.images = images.length ? images : primary ? [primary] : [];
      }
      const item = await Model.findByIdAndUpdate(req.params.id, data, {
        new: true,
        runValidators: true,
      });
      if (!item)
        return res
          .status(404)
          .json({ error: `${path.slice(0, -1)} not found.` });
      res.json({ item });
    }),
  );
  router.delete(
    `/${path}/:id`,
    asyncHandler(async (req, res) => {
      if (!validId(req.params.id))
        return res
          .status(400)
          .json({ error: `Invalid ${path.slice(0, -1)} ID.` });
      if (path === "categories") {
        const catDoc = await Category.findById(req.params.id).lean();
        const categoryIdMatch = await ProductCategory.find({ categoryId: req.params.id })
          .populate("productId", "title")
          .limit(5)
          .lean();
        const hasProducts = categoryIdMatch.length > 0 || (catDoc && await Product.exists({ category: catDoc.name }));
        if (hasProducts) {
          const totalCount = await ProductCategory.countDocuments({ categoryId: req.params.id });
          const titles = categoryIdMatch.map((c) => c.productId?.title).filter(Boolean);
          const sample = titles.length ? ` (${titles.map((t) => `"${t}"`).join(", ")})` : "";
          return res.status(409).json({
            error: `Cannot delete "${catDoc?.name || "category"}" because it is assigned to ${totalCount || "several"} product(s)${sample}. Move or reassign those products first.`,
          });
        }
      }
      if (path === "brands") {
        const brandDoc = await Brand.findById(req.params.id).lean();
        if (brandDoc) {
          const filter = {
            $or: [
              { brandId: req.params.id },
              { brand: brandDoc.name },
            ],
          };
          const count = await Product.countDocuments(filter);
          if (count > 0) {
            const sampleProducts = await Product.find(filter)
              .select("title")
              .limit(4)
              .lean();
            const titles = sampleProducts.map((p) => `"${p.title}"`).join(", ");
            const more = count > sampleProducts.length ? ` and ${count - sampleProducts.length} more` : "";
            return res.status(409).json({
              error: `Cannot delete brand "${brandDoc.name}" because it is assigned to ${count} product${count > 1 ? "s" : ""} (${titles}${more}). Move or reassign those products first.`,
            });
          }
        } else if (await Product.exists({ brandId: req.params.id })) {
          return res.status(409).json({
            error: "This brand is assigned to products. Move those products first.",
          });
        }
      }
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item)
        return res
          .status(404)
          .json({ error: `${path.slice(0, -1)} not found.` });
      res.json({ item });
    }),
  );
}
collectionRoutes("categories", Category, categorySchema);
collectionRoutes("brands", Brand, brandSchema);
collectionRoutes("coupons", Coupon, couponSchema);

router.get(
  "/reviews",
  asyncHandler(async (_req, res) =>
    res.json({
      items: await ProductReview.find()
        .populate("productId", "title")
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(500)
        .lean(),
    }),
  ),
);
router.patch(
  "/reviews/:id",
  asyncHandler(async (req, res) => {
    if (!validId(req.params.id))
      return res.status(400).json({ error: "Invalid review ID." });
    const parsed = z
      .object({
        isApproved: z.coerce.boolean().optional(),
        status: z.enum(["pending", "approved", "rejected"]).optional(),
      })
      .safeParse(req.body);
    if (!parsed.success) return invalid(res, parsed);

    const updateData = { ...parsed.data };
    if (updateData.status) {
      updateData.isApproved = updateData.status === "approved";
    } else if (updateData.isApproved !== undefined) {
      updateData.status = updateData.isApproved ? "approved" : "rejected";
    }

    const item = await ProductReview.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    );
    if (!item) return res.status(404).json({ error: "Review not found." });

    // Recalculate average rating and reviews count on product
    if (item.productId) {
      await syncProductRating(item.productId);
    }

    res.json({ item });
  }),
);
router.delete(
  "/reviews/:id",
  asyncHandler(async (req, res) => {
    if (!validId(req.params.id))
      return res.status(400).json({ error: "Invalid review ID." });
    const item = await ProductReview.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Review not found." });
    if (item.productId) {
      await syncProductRating(item.productId);
    }
    res.json({ item });
  }),
);

router.get(
  "/customers",
  asyncHandler(async (_req, res) => {
    const items = await Order.aggregate([
      {
        $group: {
          _id: "$customer.email",
          name: {
            $first: {
              $concat: ["$customer.firstName", " ", "$customer.lastName"],
            },
          },
          orders: { $sum: 1 },
          spent: { $sum: "$total" },
          lastOrder: { $max: "$createdAt" },
        },
      },
      { $sort: { lastOrder: -1 } },
      { $limit: 500 },
    ]);
    res.json({
      items: items.map((item) => ({
        email: item._id,
        name: item.name,
        orders: item.orders,
        spent: item.spent,
        lastOrder: item.lastOrder,
      })),
    });
  }),
);

router.get(
  "/blogs",
  asyncHandler(async (_req, res) =>
    res.json({
      items: await BlogPost.find().sort({ createdAt: -1 }).limit(500).lean(),
    }),
  ),
);
router.post(
  "/blogs",
  asyncHandler(async (req, res) => {
    const parsed = blogSchema.safeParse(req.body);
    if (!parsed.success) return invalid(res, parsed);
    const author = await User.findOne({ email: req.admin.email })
      .select("_id")
      .lean();
    if (!author)
      return res
        .status(409)
        .json({
          error:
            "Create an admin user in the users collection before publishing blog posts.",
        });
    const item = await BlogPost.create({
      ...parsed.data,
      category: parsed.data.category || parsed.data.tags?.[0] || "Wellness",
      authorId: author._id,
      slug: slugify(parsed.data.slug || parsed.data.title),
      publishedAt: parsed.data.status === "published" ? new Date() : undefined,
    });
    res.status(201).json({ item });
  }),
);
router.put(
  "/blogs/:id",
  asyncHandler(async (req, res) => {
    if (!validId(req.params.id))
      return res.status(400).json({ error: "Invalid blog post ID." });
    const parsed = blogSchema.safeParse(req.body);
    if (!parsed.success) return invalid(res, parsed);

    const item = await BlogPost.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Blog post not found." });

    item.set({
      ...parsed.data,
      category:
        parsed.data.category || parsed.data.tags?.[0] || item.category || "Wellness",
    });
    item.publishedAt =
      parsed.data.status === "published" ? item.publishedAt || new Date() : null;
    await item.save();
    res.json({ item });
  }),
);
router.get(
  "/users",
  asyncHandler(async (_req, res) =>
    res.json({
      items: await User.find({ role: "admin" })
        .sort({ createdAt: -1 })
        .limit(500)
        .lean(),
    }),
  ),
);

module.exports = router;
