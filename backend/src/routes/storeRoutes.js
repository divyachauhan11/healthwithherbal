const express = require("express");
const mongoose = require("mongoose");
const asyncHandler = require("../middleware/asyncHandler");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const Coupon = require("../models/Coupon");
const BlogPost = require("../models/BlogPost");
const ProductReview = require("../models/ProductReview");
const User = require("../models/User");
const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const StoreSetting = require("../models/StoreSetting");

const router = express.Router();

// Indian postal PIN code prefixes by state/UT
const STATE_PIN_PREFIXES = {
  Jharkhand: ["81", "82", "83"],
  "Tamil Nadu": ["60", "61", "62", "63", "64"],
  Maharashtra: ["40", "41", "42", "43", "44"],
  Karnataka: ["56", "57", "58", "59"],
  Delhi: ["11"],
  "Uttar Pradesh": ["20", "21", "22", "23", "24", "25", "26", "27", "28"],
  Gujarat: ["36", "37", "38", "39"],
  Kerala: ["67", "68", "69"],
  "West Bengal": ["70", "71", "72", "73", "74"],
  Punjab: ["14", "15", "16"],
  Haryana: ["12", "13"],
  Rajasthan: ["30", "31", "32", "33", "34"],
  "Madhya Pradesh": ["45", "46", "47", "48"],
  Bihar: ["80", "81", "82", "84", "85"],
  "Andhra Pradesh": ["51", "52", "53"],
  Telangana: ["50"],
  Assam: ["78"],
  Odisha: ["75", "76", "77"],
};

// GET /api/store/init - Full store data from MongoDB in a single call
router.get(
  "/init",
  asyncHandler(async (_req, res) => {
    const [productsRaw, categories, brands, coupons, blogs, reviews, announcementSetting] =
      await Promise.all([
        Product.find({ active: true }).sort({ legacyId: 1 }).lean(),
        Category.find({ isActive: true }).sort({ name: 1 }).lean(),
        Brand.find({ isActive: { $ne: false } }).sort({ name: 1 }).lean(),
        Coupon.find({
          isActive: true,
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gte: new Date() } },
          ],
        })
          .sort({ createdAt: -1 })
          .lean(),
        BlogPost.find({ status: "published" })
          .populate("authorId", "name email")
          .sort({ publishedAt: -1 })
          .lean(),
        ProductReview.find({ isApproved: true })
          .populate("productId", "title legacyId")
          .populate("userId", "name")
          .sort({ createdAt: -1 })
          .limit(20)
          .lean(),
        StoreSetting.findOne({ key: "announcements" }).lean(),
      ]);

    const products = productsRaw.map(({ legacyId, ...p }) => ({
      ...p,
      rating: Number(p.rating) || 0,
      reviews: Number(p.reviews) || 0,
      id: legacyId || p._id,
    }));

    res.json({
      products,
      categories,
      brands,
      coupons,
      announcements: Array.isArray(announcementSetting?.value) ? announcementSetting.value : [],
      shippingConfig: {
        freeShippingThreshold: 999,
        defaultStandardRate: 49,
        defaultExpressRate: 99,
        currency: "INR",
      },
      blogs: blogs.map((b) => ({
        ...b,
        author: b.author || b.authorId?.name || "Ayurvedic Practitioner",
        date: b.publishedAt
          ? new Date(b.publishedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : "",
        readTime: b.readTime || `${Math.max(3, Math.ceil((b.content || "").split(/\s+/).length / 180))} min read`,
      })),
      reviews: reviews.map((r) => ({
        ...r,
        reviewerName: r.userId?.name || "Verified Customer",
        productTitle: r.productId?.title || "",
        productId: r.productId?.legacyId || r.productId?._id,
      })),
    });
  }),
);

// GET /api/categories
router.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .lean();
    res.json(categories);
  }),
);

// GET /api/brands
router.get(
  "/brands",
  asyncHandler(async (_req, res) => {
    const brands = await Brand.find({ isActive: { $ne: false } })
      .sort({ name: 1 })
      .lean();
    res.json(brands);
  }),
);

// GET /api/coupons
router.get(
  "/coupons",
  asyncHandler(async (_req, res) => {
    const coupons = await Coupon.find({
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gte: new Date() } },
      ],
    }).lean();
    res.json(coupons);
  }),
);

// GET /api/coupons/validate?code=...
router.get(
  "/coupons/validate",
  asyncHandler(async (req, res) => {
    const code = String(req.query.code || "")
      .trim()
      .toUpperCase();
    if (!code)
      return res.status(400).json({ error: "Coupon code is required." });

    const coupon = await Coupon.findOne({
      code,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gte: new Date() } },
      ],
    }).lean();

    if (!coupon)
      return res.status(404).json({ error: "Invalid or expired coupon code." });
    res.json({ valid: true, coupon });
  }),
);

// POST /api/shipping/estimate - Calculate real database shipping rates
router.post(
  "/shipping/estimate",
  asyncHandler(async (req, res) => {
    const {
      country = "India",
      province = "Jharkhand",
      postalCode = "",
      orderTotal = 0,
    } = req.body || {};
    const cleanZip = String(postalCode || "").trim();

    if (!cleanZip) {
      return res.status(400).json({
        error: `Please enter a postal PIN code for ${province}, ${country}`,
      });
    }

    if (country === "India") {
      if (!/^\d{6}$/.test(cleanZip)) {
        return res.status(400).json({
          error: `Enter a valid PIN code for ${province}, ${country}`,
        });
      }

      const prefixes = STATE_PIN_PREFIXES[province];
      if (prefixes && prefixes.length > 0) {
        const matches = prefixes.some((pfx) => cleanZip.startsWith(pfx));
        if (!matches) {
          return res.status(400).json({
            error: `Enter a valid PIN code for ${province}, ${country}`,
          });
        }
      }

      const isFree = Number(orderTotal) >= 999;
      const today = new Date();
      const minDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
      const maxDate = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);
      const opts = { day: "numeric", month: "long" };

      return res.json({
        country,
        province,
        postalCode: cleanZip,
        eligibleForFreeShipping: isFree,
        freeShippingThreshold: 999,
        deliveryWindow: `${minDate.toLocaleDateString("en-IN", opts)} - ${maxDate.toLocaleDateString("en-IN", opts)}`,
        rates: [
          {
            name: "Standard Shipping",
            price: isFree ? 0 : 49,
            currency: "INR",
            estimatedDays: "3-5 business days",
            isFree,
          },
          {
            name: "Express Delivery",
            price: 99,
            currency: "INR",
            estimatedDays: "1-2 business days",
            isFree: false,
          },
        ],
        message: isFree
          ? `Standard Shipping: FREE for ${province}! (Estimated delivery in 3-5 days)`
          : `Standard Delivery: Rs. 49.00 to ${province} (Estimated delivery in 3-5 days)`,
      });
    }

    // International Shipping
    return res.json({
      country,
      province,
      postalCode: cleanZip,
      eligibleForFreeShipping: false,
      rates: [
        {
          name: "International Express",
          price: 450,
          currency: "INR",
          estimatedDays: "7-10 business days",
          isFree: false,
        },
      ],
      message: `International Express: Rs. 450.00 to ${country} (Estimated delivery in 7-10 days)`,
    });
  }),
);

// GET /api/cart?sessionId=... - Get user/session cart from MongoDB
router.get(
  "/cart",
  asyncHandler(async (req, res) => {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.json({ cart: null, items: [] });
    }

    const cart = await Cart.findOne({ sessionId }).populate("couponId").lean();
    if (!cart) {
      return res.json({ cart: null, items: [] });
    }

    const cartItems = await CartItem.find({ cartId: cart._id })
      .populate("productId")
      .lean();

    res.json({
      cart,
      items: cartItems.map((ci) => ({
        id: ci.productId?.legacyId || ci.productId?._id,
        quantity: ci.quantity,
        priceSnapshot: ci.priceSnapshot,
        product: ci.productId,
      })),
    });
  }),
);

// POST /api/cart/sync - Sync cart state, quantities, and orderNote to MongoDB
router.post(
  "/cart/sync",
  asyncHandler(async (req, res) => {
    const {
      sessionId,
      items = [],
      orderNote = "",
      couponCode = "",
    } = req.body || {};
    if (!sessionId) {
      return res
        .status(400)
        .json({ error: "sessionId is required to sync cart." });
    }

    let couponDoc = null;
    if (couponCode) {
      couponDoc = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
      })
        .select("_id")
        .lean();
    }

    let cart = await Cart.findOne({ sessionId });
    if (!cart) {
      cart = await Cart.create({
        sessionId,
        orderNote,
        couponId: couponDoc ? couponDoc._id : null,
      });
    } else {
      cart.orderNote = orderNote;
      cart.couponId = couponDoc ? couponDoc._id : null;
      await cart.save();
    }

    // Synchronize CartItem documents
    await CartItem.deleteMany({ cartId: cart._id });

    if (Array.isArray(items) && items.length > 0) {
      const legacyIds = items.map((it) => it.id || it.productId);
      const products = await Product.find({
        legacyId: { $in: legacyIds },
        active: true,
      }).lean();

      const itemsToInsert = [];
      for (const item of items) {
        const prodId = item.id || item.productId;
        const matched = products.find((p) => p.legacyId === prodId);
        if (matched) {
          itemsToInsert.push({
            cartId: cart._id,
            productId: matched._id,
            quantity: Math.max(1, Number(item.quantity) || 1),
            priceSnapshot: matched.price,
          });
        }
      }

      if (itemsToInsert.length > 0) {
        await CartItem.insertMany(itemsToInsert);
      }
    }

    res.json({ success: true, cartId: cart._id, orderNote: cart.orderNote });
  }),
);

// GET /api/blogs
router.get(
  "/blogs",
  asyncHandler(async (_req, res) => {
    const blogs = await BlogPost.find({ status: "published" })
      .populate("authorId", "name email")
      .sort({ publishedAt: -1 })
      .lean();

    res.json(
      blogs.map((b) => ({
        ...b,
        author: b.author || b.authorId?.name || "Dr. Ananya Sharma, BAMS",
        date: b.publishedAt
          ? new Date(b.publishedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : "",
        readTime: b.readTime || `${Math.max(3, Math.ceil((b.content || "").split(/\s+/).length / 180))} min read`,
      })),
    );
  }),
);

// GET /api/blogs/:slug
router.get(
  "/blogs/:slug",
  asyncHandler(async (req, res) => {
    const post = await BlogPost.findOne({
      slug: req.params.slug,
      status: "published",
    })
      .populate("authorId", "name email")
      .lean();

    if (!post) return res.status(404).json({ error: "Blog post not found." });
    res.json({
      ...post,
      author: post.author || post.authorId?.name || "Dr. Ananya Sharma, BAMS",
      date: post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "",
      readTime: post.readTime || `${Math.max(3, Math.ceil((post.content || "").split(/\s+/).length / 180))} min read`,
    });
  }),
);

// GET /api/reviews
router.get(
  "/reviews",
  asyncHandler(async (req, res) => {
    const filter = { isApproved: true };
    if (req.query.productId) {
      if (mongoose.isValidObjectId(req.query.productId)) {
        filter.productId = req.query.productId;
      } else {
        const prod = await Product.findOne({
          legacyId: Number(req.query.productId),
        })
          .select("_id")
          .lean();
        if (prod) filter.productId = prod._id;
      }
    }

    const reviews = await ProductReview.find(filter)
      .populate("productId", "title legacyId")
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json(
      reviews.map((r) => ({
        ...r,
        reviewerName: r.userId?.name || r.userName || "Verified Customer",
        productTitle: r.productId?.title || "",
        productId: r.productId?.legacyId || r.productId?._id,
      })),
    );
  }),
);

// POST /api/reviews - Customer submits review for a purchased product
router.post(
  "/reviews",
  asyncHandler(async (req, res) => {
    const {
      productId,
      legacyId,
      productTitle,
      userId,
      userName,
      userEmail,
      orderNumber,
      rating,
      title,
      comment,
    } = req.body || {};

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res
        .status(400)
        .json({ error: "Please provide a rating between 1 and 5 stars." });
    }

    if (!comment || !String(comment).trim()) {
      return res
        .status(400)
        .json({ error: "Please write a comment for your review." });
    }

    // Resolve product ObjectId
    let resolvedProductId = null;
    if (productId && mongoose.isValidObjectId(productId)) {
      resolvedProductId = productId;
    } else if (legacyId) {
      const prod = await Product.findOne({ legacyId: Number(legacyId) })
        .select("_id")
        .lean();
      if (prod) resolvedProductId = prod._id;
    } else if (productTitle) {
      const prod = await Product.findOne({
        title: new RegExp(`^${productTitle.trim()}$`, "i"),
      })
        .select("_id")
        .lean();
      if (prod) resolvedProductId = prod._id;
    }

    if (!resolvedProductId) {
      return res
        .status(400)
        .json({ error: "Valid product ID is required to submit a review." });
    }

    // Resolve user ID if present
    let validUserId = null;
    if (userId && mongoose.isValidObjectId(userId)) {
      validUserId = userId;
    } else if (userEmail) {
      const u = await User.findOne({
        email: String(userEmail).trim().toLowerCase(),
      })
        .select("_id")
        .lean();
      if (u) validUserId = u._id;
    }

    // Check if user already reviewed this product on this order
    if (orderNumber) {
      const existing = await ProductReview.findOne({
        orderNumber: String(orderNumber).trim(),
        productId: resolvedProductId,
      });
      if (existing) {
        return res.status(400).json({
          error: "You have already submitted a review for this product on this order.",
          item: existing,
        });
      }
    }

    const review = await ProductReview.create({
      productId: resolvedProductId,
      userId: validUserId,
      userName: String(userName || "").trim() || "Verified Buyer",
      userEmail: String(userEmail || "").trim().toLowerCase(),
      orderNumber: String(orderNumber || "").trim(),
      rating: numRating,
      title: String(title || "").trim(),
      comment: String(comment || "").trim(),
      status: "pending",
      isApproved: false,
    });

    res.status(201).json({
      success: true,
      message:
        "Review submitted successfully! It will appear on the store once approved by our moderation team.",
      review,
    });
  }),
);

module.exports = router;
