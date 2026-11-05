const mongoose = require("mongoose");
const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    userPhone: { type: String, trim: true, index: true },
    userEmail: { type: String, trim: true, lowercase: true, index: true },
    type: { type: String, enum: ["shipping", "billing"], default: "shipping" },
    tag: { type: String, default: "Home" },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true, default: "" },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true, default: "" },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: "India" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);
module.exports = mongoose.model("Address", addressSchema);
