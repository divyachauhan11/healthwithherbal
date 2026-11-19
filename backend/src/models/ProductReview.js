const mongoose = require("mongoose");
const { REVIEW_STATUSES } = require("../constants/statuses");
const schema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    userName: { type: String, default: "" },
    userEmail: { type: String, default: "" },
    orderNumber: { type: String, default: "", index: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    title: { type: String, default: "" },
    comment: { type: String, required: true },
    status: {
      type: String,
      enum: REVIEW_STATUSES,
      default: REVIEW_STATUSES[0],
      index: true,
    },
    isApproved: { type: Boolean, default: false, index: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false, timestamps: true },
);

module.exports = mongoose.model("ProductReview", schema, "product_reviews");
