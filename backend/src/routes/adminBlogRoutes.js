function registerAdminBlogRoutes({
  router,
  asyncHandler,
  BlogPost,
  blogSchema,
  invalid,
  User,
  slugify,
}) {
  router.get(
    "/blogs",
    asyncHandler(async (_req, res) =>
      res.json({
        items: await BlogPost.find().sort({ createdAt: -1 }).limit(500).lean(),
      }),
    ),
  );
  router.post(
    "/blogs",
    asyncHandler(async (req, res) => {
      const parsed = blogSchema.safeParse(req.body);
      if (!parsed.success) return invalid(res, parsed);
      const author = await User.findOne({ email: req.admin.email })
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
}

module.exports = registerAdminBlogRoutes;
