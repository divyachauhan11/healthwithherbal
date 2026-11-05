const mongoose = require("mongoose");
const schema = new mongoose.Schema({ userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, addedAt: { type: Date, default: Date.now } }, { versionKey: false });
schema.index({ userId: 1, productId: 1 }, { unique: true });
module.exports = mongoose.model("Wishlist", schema);
