const mongoose = require("mongoose");
const { BLOG_COMMENT_STATUSES } = require("../constants/statuses");
const schema = new mongoose.Schema({ postId: { type: mongoose.Schema.Types.ObjectId, ref: "BlogPost", required: true, index: true }, userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, parentId: { type: mongoose.Schema.Types.ObjectId, ref: "BlogComment", default: null }, authorName: String, authorEmail: String, content: { type: String, required: true }, status: { type: String, enum: BLOG_COMMENT_STATUSES, default: BLOG_COMMENT_STATUSES[0] } }, { timestamps: true, versionKey: false });
module.exports = mongoose.model("BlogComment", schema, "blog_comments");
