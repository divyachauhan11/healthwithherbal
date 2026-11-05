const mongoose = require("mongoose");
const schema = new mongoose.Schema({ productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true }, url: { type: String, required: true }, altText: { type: String, default: "" }, sortOrder: { type: Number, default: 0 }, isPrimary: { type: Boolean, default: false } }, { timestamps: true, versionKey: false });
module.exports = mongoose.model("ProductImage", schema, "product_images");
