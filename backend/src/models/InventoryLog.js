const mongoose = require("mongoose");
const { INVENTORY_LOG_TYPES } = require("../constants/inventory");
const schema = new mongoose.Schema({ productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true }, orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null }, performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, type: { type: String, enum: INVENTORY_LOG_TYPES, required: true }, quantityChange: { type: Number, required: true }, stockBefore: { type: Number, min: 0, required: true }, stockAfter: { type: Number, min: 0, required: true }, batchNo: String, expiryDate: Date, reason: String }, { timestamps: true, versionKey: false });
module.exports = mongoose.model("InventoryLog", schema, "inventory_logs");
