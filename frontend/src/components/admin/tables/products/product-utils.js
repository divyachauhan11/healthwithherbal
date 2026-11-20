/**
 * Split a comma separated badge string into trimmed, non-empty badges.
 * @param {string} badge e.g. "New, Bestseller"
 * @returns {Array<string>}
 */
export const parseProductBadges = (badge) => badge
  .split(",")
  .map((b) => b.trim())
  .filter(Boolean);

/**
 * Whether a product is paused (hidden from the storefront).
 * @param {{active?: boolean}} product
 * @returns {boolean}
 */
export const isProductPaused = (product) => product.active === false;
