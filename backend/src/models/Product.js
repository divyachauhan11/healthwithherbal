const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", index: true },
    legacyId: { type: Number, required: true, unique: true, index: true },
    sku: { type: String, trim: true, uppercase: true, sparse: true, unique: true },
    brand: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    category: { type: String, required: true, trim: true, index: true },
    type: { type: String, enum: ["concern", "form"], default: "form" },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviews: { type: Number, min: 0, default: 0 },
    original: { type: Number, min: 0, required: true },
    price: { type: Number, min: 0, required: true },
    salePrice: { type: Number, min: 0 },
    currency: { type: String, default: "INR", uppercase: true },
    weightG: { type: Number, min: 0, default: 0 },
    stockQty: { type: Number, min: 0, default: 0 },
    lowStockThreshold: { type: Number, min: 0, default: 5 },
    image: { type: String, default: "" },
    images: { type: [String], default: [] },
    badge: { type: String, default: null },
    description: { type: String, required: true },
    active: { type: Boolean, default: true, index: true },
    avgRating: { type: Number, min: 0, max: 5, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Product", productSchema);
