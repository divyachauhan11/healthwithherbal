const { attachBlogMetrics } = require("../utils/blogMetrics");
const { slugify } = require("../utils/string");
const { ADMIN_ROLES } = require("../constants/roles");
const { BLOG_POST_STATUSES, REVIEW_STATUSES } = require("../constants/statuses");
const { validate } = require("../middleware/validate");
const { validateObjectId } = require("../middleware/validateObjectId");

function registerAdminBlogRoutes({
  router,
  asyncHandler,
  BlogPost,
  BlogComment,
  BlogLike,
  BlogView,
  blogSchema,
  invalid,
  User,
}) {
  router.get(
    "/blogs",
    asyncHandler(async (_req, res) => {
      const items = await BlogPost.find().sort({ createdAt: -1 }).limit(500).lean();
      res.json({ items: await attachBlogMetrics(items, { includeUnapprovedComments: true }) });
    }),
  );
  router.post(
    "/blogs",
    validate(blogSchema, { onInvalid: invalid }),
    asyncHandler(async (req, res) => {
      const data = req.validatedBody;
      const author = await User.findOne({
        email: req.admin.email,
        role: { $in: ADMIN_ROLES },
      })
        .select("_id")
        .lean();
      if (!author)
        return res
          .status(409)
          .json({
            error:
              "Create an admin user in the users collection before publishing blog posts.",
          });
      const item = await BlogPost.create({
        ...data,
        category: data.category || data.tags?.[0] || "Wellness",
        authorId: author._id,
        slug: slugify(data.slug || data.title),
        publishedAt: data.status === BLOG_POST_STATUSES[1] ? new Date() : undefined,
      });
      res.status(201).json({ item });
    }),
  );
  router.put(
    "/blogs/:id",
    validateObjectId("id", { message: "Invalid blog post ID." }),
    validate(blogSchema, { onInvalid: invalid }),
    asyncHandler(async (req, res) => {
      const data = req.validatedBody;

      const item = await BlogPost.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Blog post not found." });

      item.set({
        ...data,
        category:
          data.category || data.tags?.[0] || item.category || "Wellness",
      });
      item.publishedAt =
        data.status === BLOG_POST_STATUSES[1] ? item.publishedAt || new Date() : null;
      await item.save();
      res.json({ item });
    }),
  );
  router.delete(
    "/blogs/:id",
    validateObjectId("id", { message: "Invalid blog post ID." }),
    asyncHandler(async (req, res) => {
      const item = await BlogPost.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Blog post not found." });

      await Promise.all([
        BlogComment.deleteMany({ postId: item._id }),
        BlogLike.deleteMany({ postId: item._id }),
        BlogView.deleteMany({ postId: item._id }),
      ]);
      await item.deleteOne();

      res.json({ success: true });
    }),
  );

  router.get(
    "/blogs/:id/comments",
    validateObjectId("id", { message: "Invalid blog post ID." }),
    asyncHandler(async (req, res) => {
      const exists = await BlogPost.exists({ _id: req.params.id });
      if (!exists) return res.status(404).json({ error: "Blog post not found." });
      const items = await BlogComment.find({ postId: req.params.id })
        .sort({ createdAt: -1 })
        .limit(500)
        .lean();
      res.json({ items });
    }),
  );

  router.patch(
    "/blogs/:id/comments/:commentId",
    validateObjectId(["id", "commentId"], {
      message: "Invalid blog post or comment ID.",
    }),
    asyncHandler(async (req, res) => {
      const status = req.body?.status;
      if (!REVIEW_STATUSES.includes(status))
        return res.status(400).json({ error: "Choose a valid comment status." });
      const comment = await BlogComment.findOneAndUpdate(
        { _id: req.params.commentId, postId: req.params.id },
        { $set: { status } },
        { new: true, runValidators: true },
      ).lean();
      if (!comment) return res.status(404).json({ error: "Comment not found." });
      res.json({ item: comment });
    }),
  );
  router.delete(
    "/blogs/:id/comments/:commentId",
    validateObjectId(["id", "commentId"], {
      message: "Invalid blog post or comment ID.",
    }),
    asyncHandler(async (req, res) => {
      const comment = await BlogComment.findOneAndDelete({
        _id: req.params.commentId,
        postId: req.params.id,
      });
      if (!comment) return res.status(404).json({ error: "Comment not found." });
      res.json({ success: true, id: String(comment._id) });
    }),
  );
}

module.exports = registerAdminBlogRoutes;
