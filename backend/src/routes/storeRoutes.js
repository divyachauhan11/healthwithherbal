const express = require("express");
const mongoose = require("mongoose");
const asyncHandler = require("../middleware/asyncHandler");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const Coupon = require("../models/Coupon");
const BlogPost = require("../models/BlogPost");
const BlogComment = require("../models/BlogComment");
const BlogLike = require("../models/BlogLike");
const BlogView = require("../models/BlogView");
const ProductReview = require("../models/ProductReview");
const User = require("../models/User");
const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const StoreSetting = require("../models/StoreSetting");
const { isCouponExpired } = require("../utils/couponExpiry");
const { attachBlogMetrics } = require("../utils/blogMetrics");
const { USER_ROLES } = require("../constants/roles");
const {
  BLOG_POST_STATUSES,
  BLOG_COMMENT_STATUSES,
  REVIEW_STATUSES,
} = require("../constants/statuses");
const { rateLimit } = require("express-rate-limit");

const router = express.Router();
const isCouponUsageLimitReached = (coupon) =>
  coupon.usageLimit != null &&
  Number(coupon.usedCount || 0) >= Number(coupon.usageLimit);
const blogViewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
const blogInteractionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

async function getStoreCategories() {
  const [categories, parentIds] = await Promise.all([
    Category.find({ isActive: true, isParent: { $ne: true } }).sort({ name: 1 }).lean(),
    Category.distinct("parentId", { parentId: { $ne: null } }),
  ]);
  const parentIdSet = new Set(parentIds.map(String));
  return categories.filter((category) => !parentIdSet.has(String(category._id)));
}

async function getStoreNavigationCategories() {
  const [categories, parentIds] = await Promise.all([
    Category.find({ isActive: true }).sort({ name: 1 }).lean(),
    Category.distinct("parentId", { parentId: { $ne: null } }),
  ]);
  const parentIdSet = new Set(parentIds.map(String));
  return categories.map((category) => ({
    ...category,
    isParent: Boolean(category.isParent || parentIdSet.has(String(category._id))),
  }));
}

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
    const [productsRaw, categories, navigationCategories, brands, coupons, blogs, reviews, announcementSetting, featuredCategorySetting, returnExchangeSetting] =
      await Promise.all([
        Product.find({ active: true }).sort({ legacyId: 1 }).lean(),
        getStoreCategories(),
        getStoreNavigationCategories(),
        Brand.find({ isActive: { $ne: false } }).sort({ name: 1 }).lean(),
        Coupon.find({ isActive: true })
          .sort({ createdAt: -1 })
          .lean()
          .then((items) => items.filter((coupon) => !isCouponExpired(coupon.expiresAt))),
        BlogPost.find({ status: BLOG_POST_STATUSES[1] })
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
        StoreSetting.findOne({ key: "featuredParentCategories" }).lean(),
        StoreSetting.findOne({ key: "returnExchangeEnabled" }).lean(),
      ]);

    const blogsWithMetrics = await attachBlogMetrics(blogs);

    const parentCategories = navigationCategories.filter((category) => category.isParent);
    const selectedFeaturedIds = Array.isArray(featuredCategorySetting?.value)
      ? featuredCategorySetting.value.map(String)
      : [];
    const availableParentIds = new Set(parentCategories.map((category) => String(category._id)));
    const featuredCategoryIds = selectedFeaturedIds.filter((id) => availableParentIds.has(id));
    const effectiveFeaturedCategoryIds = featuredCategoryIds.length
      ? featuredCategoryIds.slice(0, 4)
      : parentCategories.slice(0, 4).map((category) => String(category._id));

    const products = productsRaw.map(({ legacyId, ...p }) => ({
      ...p,
      rating: Number(p.rating) || 0,
      reviews: Number(p.reviews) || 0,
      id: legacyId || p._id,
    }));

    res.json({
      products,
      categories,
      navigationCategories,
      featuredCategoryIds: effectiveFeaturedCategoryIds,
      brands,
      coupons,
      announcements: Array.isArray(announcementSetting?.value) ? announcementSetting.value : [],
      returnExchangeEnabled: returnExchangeSetting?.value !== false,
      shippingConfig: {
        freeShippingThreshold: 0,
        defaultStandardRate: 0,
        defaultExpressRate: 99,
        currency: "INR",
      },
      blogs: blogsWithMetrics.map((b) => ({
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
    const categories = await getStoreCategories();
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
    const coupons = (await Coupon.find({ isActive: true }).lean()).filter(
      (coupon) =>
        !isCouponExpired(coupon.expiresAt) &&
        !isCouponUsageLimitReached(coupon),
    );
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

    const coupon = await Coupon.findOne({ code, isActive: true }).lean();

    if (
      !coupon ||
      isCouponExpired(coupon.expiresAt) ||
      isCouponUsageLimitReached(coupon)
    )
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

      const isFree = true;
      const today = new Date();
      const minDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
      const maxDate = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);
      const opts = { day: "numeric", month: "long" };

      return res.json({
        country,
        province,
        postalCode: cleanZip,
        eligibleForFreeShipping: isFree,
        freeShippingThreshold: 0,
        deliveryWindow: `${minDate.toLocaleDateString("en-IN", opts)} - ${maxDate.toLocaleDateString("en-IN", opts)}`,
        rates: [
          {
            name: "Standard Shipping",
            price: 0,
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
        message: `Standard Shipping: FREE for ${province}! (Estimated delivery in 3-5 days)`,
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
    const blogs = await BlogPost.find({ status: BLOG_POST_STATUSES[1] })
      .populate("authorId", "name email")
      .sort({ publishedAt: -1 })
      .lean();
    const blogsWithMetrics = await attachBlogMetrics(blogs);

    res.json(
      blogsWithMetrics.map((b) => ({
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
      status: BLOG_POST_STATUSES[1],
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

router.get(
  "/blogs/:slug/community",
  asyncHandler(async (req, res) => {
    const post = await BlogPost.findOne({ slug: req.params.slug, status: BLOG_POST_STATUSES[1] })
      .select("_id viewsCount allowComments")
      .lean();
    if (!post) return res.status(404).json({ error: "Blog post not found." });

    const sessionId = String(req.query.sessionId || "").trim();
    const [likes, commentCount, comments, liked] = await Promise.all([
      BlogLike.countDocuments({ postId: post._id }),
      BlogComment.countDocuments({ postId: post._id, status: BLOG_COMMENT_STATUSES[1] }),
      BlogComment.find({ postId: post._id, status: BLOG_COMMENT_STATUSES[1] })
        .select("authorName content createdAt")
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
      sessionId
        ? BlogLike.exists({ postId: post._id, sessionId })
        : Promise.resolve(false),
    ]);
    res.json({
      likes,
      comments: commentCount,
      views: post.viewsCount || 0,
      liked: Boolean(liked),
      allowComments: post.allowComments !== false,
      items: comments,
    });
  }),
);

router.post(
  "/blogs/:slug/view",
  blogViewLimiter,
  asyncHandler(async (req, res) => {
    const post = await BlogPost.findOne({ slug: req.params.slug, status: BLOG_POST_STATUSES[1] }).select("_id");
    if (!post) return res.status(404).json({ error: "Blog post not found." });
    const sessionId = String(req.body?.sessionId || "").trim().slice(0, 100);
    if (sessionId.length < 16) return res.status(400).json({ error: "A valid visitor session is required." });
    const priorView = await BlogView.exists({ postId: post._id, sessionId });
    if (!priorView) {
      await BlogView.create({ postId: post._id, sessionId });
      await BlogPost.updateOne({ _id: post._id }, { $inc: { viewsCount: 1 } });
    }
    res.json({ success: true });
  }),
);

router.post(
  "/blogs/:slug/like",
  blogInteractionLimiter,
  asyncHandler(async (req, res) => {
    const post = await BlogPost.findOne({ slug: req.params.slug, status: BLOG_POST_STATUSES[1] }).select("_id");
    if (!post) return res.status(404).json({ error: "Blog post not found." });
    const sessionId = String(req.body?.sessionId || "").trim();
    if (sessionId.length < 16 || sessionId.length > 100) {
      return res.status(400).json({ error: "A valid visitor session is required to like this article." });
    }
    try {
      await BlogLike.updateOne(
        { postId: post._id, sessionId },
        { $setOnInsert: { postId: post._id, sessionId } },
        { upsert: true },
      );
    } catch (error) {
      if (error.code !== 11000) throw error;
    }
    res.json({ liked: true, likes: await BlogLike.countDocuments({ postId: post._id }) });
  }),
);

router.delete(
  "/blogs/:slug/like",
  blogInteractionLimiter,
  asyncHandler(async (req, res) => {
    const post = await BlogPost.findOne({ slug: req.params.slug, status: BLOG_POST_STATUSES[1] }).select("_id");
    if (!post) return res.status(404).json({ error: "Blog post not found." });
    const sessionId = String(req.query.sessionId || "").trim();
    if (!sessionId) return res.status(400).json({ error: "A visitor session is required to remove a like." });
    await BlogLike.deleteOne({ postId: post._id, sessionId });
    res.json({ liked: false, likes: await BlogLike.countDocuments({ postId: post._id }) });
  }),
);

router.get(
  "/blogs/:slug/comments",
  asyncHandler(async (req, res) => {
    const post = await BlogPost.findOne({ slug: req.params.slug, status: BLOG_POST_STATUSES[1] }).select("_id");
    if (!post) return res.status(404).json({ error: "Blog post not found." });
    const items = await BlogComment.find({ postId: post._id, status: BLOG_COMMENT_STATUSES[1] })
      .select("authorName content createdAt")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json({ items });
  }),
);

router.post(
  "/blogs/:slug/comments",
  blogInteractionLimiter,
  asyncHandler(async (req, res) => {
    const post = await BlogPost.findOne({ slug: req.params.slug, status: BLOG_POST_STATUSES[1] }).select("_id allowComments");
    if (!post) return res.status(404).json({ error: "Blog post not found." });
    if (post.allowComments === false) return res.status(403).json({ error: "Comments are closed for this article." });
    const authorName = String(req.body?.authorName || "").trim();
    const authorEmail = String(req.body?.authorEmail || "").trim().toLowerCase();
    const content = String(req.body?.content || "").trim();
    if (authorName.length < 2 || authorName.length > 100) {
      return res.status(400).json({ error: "Name must be between 2 and 100 characters." });
    }
    if (authorEmail.length > 254 || (authorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail))) {
      return res.status(400).json({ error: "Enter a valid email address." });
    }
    if (content.length < 3 || content.length > 2000) {
      return res.status(400).json({ error: "Comment must be between 3 and 2,000 characters." });
    }
    await BlogComment.create({ postId: post._id, authorName, authorEmail, content, status: BLOG_COMMENT_STATUSES[0] });
    await BlogPost.updateOne({ _id: post._id }, { $inc: { commentsCount: 1 } });
    res.status(201).json({ message: "Your comment was submitted and is awaiting approval." });
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
        role: USER_ROLES.CUSTOMER,
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
      status: REVIEW_STATUSES[0],
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
