const mongoose = require("mongoose");
const schema = new mongoose.Schema({ productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true } }, { timestamps: true, versionKey: false });
schema.index({ productId: 1, categoryId: 1 }, { unique: true });
module.exports = mongoose.model("ProductCategory", schema, "product_categories");
