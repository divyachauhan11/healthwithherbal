const { attachBlogMetrics } = require("../utils/blogMetrics");

function registerAdminBlogRoutes({
  router,
  asyncHandler,
  BlogPost,
  BlogComment,
  BlogLike,
  BlogView,
  blogSchema,
  invalid,
  validId,
  User,
  slugify,
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
    asyncHandler(async (req, res) => {
      const parsed = blogSchema.safeParse(req.body);
      if (!parsed.success) return invalid(res, parsed);
      const author = await User.findOne({
        email: req.admin.email,
        role: { $in: ["admin", "employee"] },
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
        ...parsed.data,
        category: parsed.data.category || parsed.data.tags?.[0] || "Wellness",
        authorId: author._id,
        slug: slugify(parsed.data.slug || parsed.data.title),
        publishedAt: parsed.data.status === "published" ? new Date() : undefined,
      });
      res.status(201).json({ item });
    }),
  );
  router.put(
    "/blogs/:id",
    asyncHandler(async (req, res) => {
      if (!validId(req.params.id))
        return res.status(400).json({ error: "Invalid blog post ID." });
      const parsed = blogSchema.safeParse(req.body);
      if (!parsed.success) return invalid(res, parsed);

      const item = await BlogPost.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Blog post not found." });

      item.set({
        ...parsed.data,
        category:
          parsed.data.category || parsed.data.tags?.[0] || item.category || "Wellness",
      });
      item.publishedAt =
        parsed.data.status === "published" ? item.publishedAt || new Date() : null;
      await item.save();
      res.json({ item });
    }),
  );
  router.delete(
    "/blogs/:id",
    asyncHandler(async (req, res) => {
      if (!validId(req.params.id))
        return res.status(400).json({ error: "Invalid blog post ID." });

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
    asyncHandler(async (req, res) => {
      if (!validId(req.params.id))
        return res.status(400).json({ error: "Invalid blog post ID." });
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
    asyncHandler(async (req, res) => {
      if (!validId(req.params.id) || !validId(req.params.commentId))
        return res.status(400).json({ error: "Invalid blog post or comment ID." });
      const status = req.body?.status;
      if (!["approved", "rejected", "pending"].includes(status))
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
    asyncHandler(async (req, res) => {
      if (!validId(req.params.id) || !validId(req.params.commentId))
        return res.status(400).json({ error: "Invalid blog post or comment ID." });
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
