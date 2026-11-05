const mongoose = require("mongoose");
const schema = new mongoose.Schema({ postId: { type: mongoose.Schema.Types.ObjectId, ref: "BlogPost", required: true }, userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, sessionId: String, createdAt: { type: Date, default: Date.now } }, { versionKey: false });
schema.index({ postId: 1, userId: 1 }, { unique: true, partialFilterExpression: { userId: { $type: "objectId" } } });
module.exports = mongoose.model("BlogLike", schema, "blog_likes");
