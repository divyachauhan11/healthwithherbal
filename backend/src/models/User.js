const mongoose = require("mongoose");
const { USER_ROLES } = require("../constants/roles");
const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
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
    role: { type: String, enum: Object.values(USER_ROLES), default: USER_ROLES.CUSTOMER },
    isActive: { type: Boolean, default: true },
    authVersion: { type: Number, default: 0 },
    passwordResetTokenHash: { type: String, default: "", select: false },
    passwordResetExpiresAt: { type: Date, default: null, select: false },
    pageAccess: { type: [String], default: [] },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    versionKey: false,
  },
);
// A customer and an admin/employee can share an email, but each account role
// remains unique for that email address.
userSchema.index({ email: 1, role: 1 }, { unique: true, name: "email_role_unique" });
module.exports = mongoose.model("User", userSchema);
