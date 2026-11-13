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
    avatarUrl: { type: String, trim: true, default: "" },
    avatarPublicId: { type: String, trim: true, default: "" },
    role: { type: String, enum: ["customer", "admin", "employee"], default: "customer" },
    isActive: { type: Boolean, default: true },
    pageAccess: { type: [String], default: [] },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    versionKey: false,
  },
);
module.exports = mongoose.model("User", userSchema);
