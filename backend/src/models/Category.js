const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
    isParent: { type: Boolean, default: false, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, unique: true },
    type: { type: String, default: "concern" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false },
);
module.exports = mongoose.model("Category", schema);
