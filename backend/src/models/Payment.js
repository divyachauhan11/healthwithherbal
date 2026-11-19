const mongoose = require("mongoose");
const { PAYMENT_STATUSES } = require("../constants/statuses");
const schema = new mongoose.Schema({ orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true }, gateway: String, gatewayTxnId: String, method: { type: String, required: true }, amount: { type: Number, min: 0, required: true }, currency: { type: String, default: "INR" }, status: { type: String, enum: PAYMENT_STATUSES, default: PAYMENT_STATUSES[0] }, paidAt: Date }, { timestamps: true, versionKey: false });
module.exports = mongoose.model("Payment", schema);
