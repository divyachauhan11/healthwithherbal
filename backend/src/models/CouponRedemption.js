const mongoose = require("mongoose");
const schema = new mongoose.Schema({ couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", required: true }, userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true }, discountAmount: { type: Number, min: 0, required: true }, redeemedAt: { type: Date, default: Date.now } }, { versionKey: false });
schema.index({ couponId: 1, orderId: 1 }, { unique: true });
module.exports = mongoose.model("CouponRedemption", schema, "coupon_redemptions");
