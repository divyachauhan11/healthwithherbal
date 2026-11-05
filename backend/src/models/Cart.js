const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null },
    sessionId: { type: String, index: true },
    currency: { type: String, default: "INR" },
    orderNote: { type: String, default: "" },
    expiresAt: { type: Date, index: { expires: 0 } },
  },
  { timestamps: true, versionKey: false }
);
module.exports = mongoose.model("Cart", schema);
