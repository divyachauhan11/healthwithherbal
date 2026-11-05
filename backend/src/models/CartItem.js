const mongoose = require("mongoose");
const schema = new mongoose.Schema({ cartId: { type: mongoose.Schema.Types.ObjectId, ref: "Cart", required: true, index: true }, productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, quantity: { type: Number, min: 1, required: true }, priceSnapshot: { type: Number, min: 0, required: true } }, { timestamps: true, versionKey: false });
schema.index({ cartId: 1, productId: 1 }, { unique: true });
module.exports = mongoose.model("CartItem", schema, "cart_items");
