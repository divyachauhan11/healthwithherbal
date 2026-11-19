const { z } = require("zod");
const { REVIEW_STATUSES } = require("../constants/statuses");
const { validate } = require("../middleware/validate");
const { validateObjectId } = require("../middleware/validateObjectId");

const reviewStatusSchema = z.object({
  isApproved: z.coerce.boolean().optional(),
  status: z.enum(REVIEW_STATUSES).optional(),
});

function registerAdminReviewRoutes({
  router,
  asyncHandler,
  ProductReview,
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
    validateObjectId("id", { message: "Invalid review ID." }),
    validate(reviewStatusSchema, { onInvalid: invalid }),
    asyncHandler(async (req, res) => {
      const updateData = { ...req.validatedBody };
      if (updateData.status) {
        updateData.isApproved = updateData.status === REVIEW_STATUSES[1];
      } else if (updateData.isApproved !== undefined) {
        updateData.status = updateData.isApproved
          ? REVIEW_STATUSES[1]
          : REVIEW_STATUSES[2];
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
    validateObjectId("id", { message: "Invalid review ID." }),
    asyncHandler(async (req, res) => {
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
