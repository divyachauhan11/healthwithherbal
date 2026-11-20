/**
 * Pure helpers for the product page: gallery images, cart quantities,
 * related products and review figures.
 */

/**
 * Gallery images of a product (its `images`, else its single `image`).
 * @param {object|null} product
 * @returns {string[]}
 */
export function getGalleryImages(product) {
  if (Array.isArray(product?.images) && product.images.length > 0) {
    return product.images.filter(Boolean);
  }
  if (product?.image) {
    return [product.image];
  }
  return [];
}

/**
 * Units of `product` already in the bag (matched by id, `_id` or `legacyId`).
 * @param {Array<string|number>} [cart]
 * @param {object|null} product
 * @returns {number}
 */
export const countProductInCart = (cart, product) =>
  (cart || []).filter((id) =>
    [product?.id, product?._id, product?.legacyId].some((productId) =>
      productId != null && String(productId) === String(id),
    ),
  ).length;

/**
 * Up to four other products: same category first, then same brand, then the rest.
 * @param {object|null} product
 * @param {Array<object>} products
 * @returns {Array<object>}
 */
export function getRelatedProducts(product, products) {
  if (!product) return [];
  const sameCategory = products.filter(
    (p) => p.category === product.category && p.id !== product.id,
  );
  const sameBrand = products.filter(
    (p) => p.brand === product.brand && p.id !== product.id,
  );
  const others = products.filter((p) => p.id !== product.id);
  const merged = Array.from(
    new Set([...sameCategory, ...sameBrand, ...others]),
  );
  return merged.slice(0, 4);
}

/**
 * Reviews from the storefront store data that belong to `product`.
 * @param {Array<object>} reviews
 * @param {object|null} product
 * @returns {Array<object>}
 */
export function matchProductReviews(reviews, product) {
  if (!reviews || reviews.length === 0 || !product) return [];
  return reviews.filter(
    (r) =>
      String(r.productId) === String(product.id) ||
      String(r.productId) === String(product._id) ||
      (product.legacyId && String(r.productId) === String(product.legacyId)),
  );
}

/**
 * Average rating (one decimal) of `reviews`, or `fallback` without reviews.
 * @param {Array<{rating?: number}>} reviews
 * @param {number} fallback
 * @returns {number}
 */
export const averageRating = (reviews, fallback) =>
  reviews.length > 0
    ? Number(
        (
          reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) /
          reviews.length
        ).toFixed(1),
      )
    : fallback;

/**
 * Review date as "Nov 20, 2026", or "Verified" when the review has no date.
 * @param {string} [createdAt]
 * @returns {string}
 */
export const formatReviewDate = (createdAt) =>
  createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Verified";
