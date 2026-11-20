/**
 * Pure helpers for the wishlist page.
 */

/**
 * Catalogue products whose id (or `_id`) is in the wishlist, in catalogue order.
 * @param {Array<object>} products
 * @param {Array<string|number>} wished Wishlist product IDs.
 * @returns {Array<object>}
 */
export function getWishlistProducts(products, wished) {
  const wishedIds = new Set(wished.map((id) => String(id)));
  return products.filter((product) =>
    wishedIds.has(String(product.id ?? product._id)),
  );
}
