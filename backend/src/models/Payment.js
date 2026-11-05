const mongoose = require("mongoose");
const schema = new mongoose.Schema({ orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true }, gateway: String, gatewayTxnId: String, method: { type: String, required: true }, amount: { type: Number, min: 0, required: true }, currency: { type: String, default: "INR" }, status: { type: String, enum: ["pending", "authorized", "paid", "failed", "refunded"], default: "pending" }, paidAt: Date }, { timestamps: true, versionKey: false });
module.exports = mongoose.model("Payment", schema);
