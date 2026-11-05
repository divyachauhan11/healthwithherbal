const mongoose = require("mongoose");
const schema = new mongoose.Schema({ orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true }, productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, titleSnapshot: { type: String, required: true }, skuSnapshot: String, unitPrice: { type: Number, min: 0, required: true }, quantity: { type: Number, min: 1, required: true }, lineTotal: { type: Number, min: 0, required: true } }, { timestamps: true, versionKey: false });
module.exports = mongoose.model("OrderItem", schema, "order_items");
