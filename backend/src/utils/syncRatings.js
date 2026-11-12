const Product = require("../models/Product");
const ProductReview = require("../models/ProductReview");

/**
 * Recalculate and update the real rating and review count for a single product.
 */
async function syncProductRating(productId) {
  if (!productId) return null;
  try {
    const approvedReviews = await ProductReview.find({
      productId,
      isApproved: true,
    })
      .select("rating")
      .lean();

    const count = approvedReviews.length;
    const avg =
      count > 0
        ? Number(
            (
              approvedReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / count
            ).toFixed(1),
          )
        : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: avg,
      reviews: count,
    });

    return { productId, rating: avg, reviews: count };
  } catch (error) {
    console.error(`Failed to sync rating for product ${productId}:`, error.message);
    return null;
  }
}

/**
 * Synchronize real ratings and review counts across all products in MongoDB.
 * Replaces any hardcoded seed values with the real count and average of approved reviews.
 */
async function syncAllProductRatings() {
  try {
    const stats = await ProductReview.aggregate([
      { $match: { isApproved: true } },
      {
        $group: {
          _id: "$productId",
          avgRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);
    const statsMap = new Map(
      stats.map((s) => [
        String(s._id),
        { rating: Number(s.avgRating.toFixed(1)), reviews: s.reviewCount },
      ]),
    );

    const products = await Product.find().select("_id").lean();
    const bulkOps = products.map((p) => {
      const st = statsMap.get(String(p._id)) || { rating: 0, reviews: 0 };
      return {
        updateOne: {
          filter: { _id: p._id },
          update: { $set: { rating: st.rating, reviews: st.reviews } },
        },
      };
    });

    if (bulkOps.length > 0) {
      await Product.bulkWrite(bulkOps);
    }
    console.log("Product ratings synchronized with real approved reviews.");
    return [];
  } catch (error) {
    console.error("Failed to sync all product ratings:", error.message);
    return [];
  }
}

module.exports = {
  syncProductRating,
  syncAllProductRatings,
};
