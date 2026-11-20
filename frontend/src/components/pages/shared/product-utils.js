/**
 * Pure helpers for product display shared by product cards and the product page.
 */

/**
 * Badge labels from a product's comma-separated `badge` field.
 * @param {string} [badge] e.g. "New, Bestseller".
 * @returns {string[]}
 */
export const parseProductBadges = (badge) =>
  (badge || "")
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);

/**
 * Whether a product has a known stock quantity of zero or less.
 * @param {{stockQty?: number|string|null}} product
 * @returns {boolean}
 */
export const isProductOutOfStock = (product) =>
  product.stockQty !== undefined &&
  product.stockQty !== null &&
  Number(product.stockQty) <= 0;
