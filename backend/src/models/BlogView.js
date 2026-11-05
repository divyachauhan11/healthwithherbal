const mongoose = require("mongoose");
const schema = new mongoose.Schema({ postId: { type: mongoose.Schema.Types.ObjectId, ref: "BlogPost", required: true, index: true }, userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, sessionId: String, ipHash: String, referrer: String, viewedAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 365 } }, { versionKey: false });
module.exports = mongoose.model("BlogView", schema, "blog_views");
