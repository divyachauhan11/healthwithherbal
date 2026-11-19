const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
  orderNumber: { type: String, required: true, index: true },
  customer: { type: mongoose.Schema.Types.Mixed, required: true },
  type: { type: String, enum: ["return", "exchange"], required: true, index: true },
  itemIndex: { type: Number, required: true, min: 0 },
  item: { type: mongoose.Schema.Types.Mixed, required: true },
  quantity: { type: Number, required: true, min: 1 },
  reason: { type: String, required: true, trim: true, maxlength: 1000 },
  photos: { type: [String], default: [] },
  status: { type: String, enum: ["pending", "approved", "rejected", "completed"], default: "pending", index: true },
  adminNote: { type: String, trim: true, maxlength: 1000, default: "" },
  refundStatus: { type: String, enum: ["not_required", "pending", "processed"], default: "pending", index: true },
  refundAmount: { type: Number, min: 0, default: 0 },
  refundMethod: { type: String, enum: ["not_applicable", "original_payment", "bank_transfer", "cash", "store_credit", "other"], default: "not_applicable" },
  refundReference: { type: String, trim: true, maxlength: 120, default: "" },
  refundProcessedAt: { type: Date, default: null },
}, { timestamps: true, versionKey: false });

schema.index(
  { orderId: 1, itemIndex: 1 },
  { unique: true, partialFilterExpression: { itemIndex: { $type: "number" } }, name: "unique_return_exchange_per_order_item" },
);

module.exports = mongoose.model("ReturnExchangeRequest", schema);
