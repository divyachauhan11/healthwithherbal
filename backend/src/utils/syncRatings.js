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
    const products = await Product.find().select("_id title").lean();
    console.log(`Synchronizing real ratings for ${products.length} products...`);

    const results = [];
    for (const p of products) {
      const res = await syncProductRating(p._id);
      if (res) results.push({ title: p.title, ...res });
    }

    console.log("Product ratings synchronized with real approved reviews.");
    return results;
  } catch (error) {
    console.error("Failed to sync all product ratings:", error.message);
    return [];
  }
}

module.exports = {
  syncProductRating,
  syncAllProductRatings,
};
