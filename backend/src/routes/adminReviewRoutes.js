const { z } = require("zod");

function registerAdminReviewRoutes({
  router,
  asyncHandler,
  ProductReview,
  validId,
  invalid,
  syncProductRating,
}) {
  router.get(
    "/reviews",
    asyncHandler(async (_req, res) =>
      res.json({
        items: await ProductReview.find()
          .populate("productId", "title")
          .populate("userId", "name email")
          .sort({ createdAt: -1 })
          .limit(500)
          .lean(),
      }),
    ),
  );
  router.patch(
    "/reviews/:id",
    asyncHandler(async (req, res) => {
      if (!validId(req.params.id))
        return res.status(400).json({ error: "Invalid review ID." });
      const parsed = z
        .object({
          isApproved: z.coerce.boolean().optional(),
          status: z.enum(["pending", "approved", "rejected"]).optional(),
        })
        .safeParse(req.body);
      if (!parsed.success) return invalid(res, parsed);

      const updateData = { ...parsed.data };
      if (updateData.status) {
        updateData.isApproved = updateData.status === "approved";
      } else if (updateData.isApproved !== undefined) {
        updateData.status = updateData.isApproved ? "approved" : "rejected";
      }

      const item = await ProductReview.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true },
      );
      if (!item) return res.status(404).json({ error: "Review not found." });

      // Recalculate average rating and reviews count on product
      if (item.productId) {
        await syncProductRating(item.productId);
      }

      res.json({ item });
    }),
  );
  router.delete(
    "/reviews/:id",
    asyncHandler(async (req, res) => {
      if (!validId(req.params.id))
        return res.status(400).json({ error: "Invalid review ID." });
      const item = await ProductReview.findByIdAndDelete(req.params.id);
      if (!item) return res.status(404).json({ error: "Review not found." });
      if (item.productId) {
        await syncProductRating(item.productId);
      }
      res.json({ item });
    }),
  );

}

module.exports = registerAdminReviewRoutes;
