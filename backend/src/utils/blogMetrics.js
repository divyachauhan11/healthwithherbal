const BlogLike = require("../models/BlogLike");
const BlogComment = require("../models/BlogComment");

async function attachBlogMetrics(posts, { includeUnapprovedComments = false } = {}) {
  if (!posts.length) return [];
  const postIds = posts.map((post) => post._id);
  const commentMatch = { postId: { $in: postIds } };
  if (!includeUnapprovedComments) commentMatch.status = "approved";

  const [likeCounts, commentCounts, pendingCommentCounts] = await Promise.all([
    BlogLike.aggregate([
      { $match: { postId: { $in: postIds } } },
      { $group: { _id: "$postId", count: { $sum: 1 } } },
    ]),
    BlogComment.aggregate([
      { $match: commentMatch },
      { $group: { _id: "$postId", count: { $sum: 1 } } },
    ]),
    includeUnapprovedComments
      ? BlogComment.aggregate([
          { $match: { postId: { $in: postIds }, status: "pending" } },
          { $group: { _id: "$postId", count: { $sum: 1 } } },
        ])
      : Promise.resolve([]),
  ]);
  const likesByPost = new Map(likeCounts.map(({ _id, count }) => [String(_id), count]));
  const commentsByPost = new Map(commentCounts.map(({ _id, count }) => [String(_id), count]));
  const pendingCommentsByPost = new Map(
    pendingCommentCounts.map(({ _id, count }) => [String(_id), count]),
  );

  return posts.map((post) => ({
    ...post,
    likesCount: likesByPost.get(String(post._id)) || 0,
    commentsCount: commentsByPost.get(String(post._id)) || 0,
    ...(includeUnapprovedComments && {
      pendingCommentsCount: pendingCommentsByPost.get(String(post._id)) || 0,
    }),
    viewsCount: post.viewsCount || 0,
  }));
}

module.exports = { attachBlogMetrics };
