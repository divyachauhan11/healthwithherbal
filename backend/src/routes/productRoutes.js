const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(48, Math.max(1, Number.parseInt(req.query.limit, 10) || 24));
    const filter = { active: true };

    if (req.query.category) filter.category = req.query.category;
    if (req.query.brand) filter.brand = req.query.brand;
    if (req.query.q) {
      const search = new RegExp(escapeRegex(String(req.query.q).slice(0, 80)), "i");
      filter.$or = [{ title: search }, { brand: search }, { category: search }, { description: search }];
    }

    const sortOptions = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { rating: -1 },
      newest: { createdAt: -1 },
    };
    const sort = sortOptions[req.query.sort] || { legacyId: 1 };
    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      items: items.map(({ legacyId, ...item }) => ({
        ...item,
        rating: Number(item.rating) || 0,
        reviews: Number(item.reviews) || 0,
        id: legacyId || item._id,
      })),
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const numericId = Number(req.params.id);
    const conditions = Number.isSafeInteger(numericId) ? [{ legacyId: numericId }] : [];
    if (mongoose.isValidObjectId(req.params.id)) conditions.push({ _id: req.params.id });
    if (!conditions.length) return res.status(400).json({ error: "Invalid product ID." });

    const product = await Product.findOne({ active: true, $or: conditions }).lean();
    if (!product) return res.status(404).json({ error: "Product not found." });
    const { legacyId, ...rest } = product;
    res.json({
      ...rest,
      rating: Number(rest.rating) || 0,
      reviews: Number(rest.reviews) || 0,
      id: legacyId || rest._id,
    });
  })
);

module.exports = router;