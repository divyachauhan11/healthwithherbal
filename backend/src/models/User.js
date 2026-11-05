const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: true,
    },
    passwordHash: {
      type: String,
      default: () => require("crypto").randomBytes(32).toString("hex"),
      select: false,
    },
    phone: { type: String, trim: true, index: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    versionKey: false,
  },
);
module.exports = mongoose.model("User", userSchema);
