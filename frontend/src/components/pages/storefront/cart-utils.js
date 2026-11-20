/**
 * Pure cart helpers. A cart is an array of product IDs with one entry per unit.
 */

/**
 * Catalogue product a cart ID refers to (matches `id`, `_id` or `legacyId`).
 * @param {Array<object>} products
 * @param {string|number} id
 * @returns {object|undefined}
 */
export const findCartProduct = (products, id) =>
  products.find((item) =>
    [item.id, item._id, item.legacyId].some((productId) =>
      productId != null && String(productId) === String(id),
    ),
  );

/**
 * Number of units of `id` in a cart.
 * @param {Array<string|number>} cartIds
 * @param {string|number} id
 * @returns {number}
 */
export const countCartUnits = (cartIds, id) => cartIds.filter((item) => String(item) === String(id)).length;

/**
 * Drop units beyond each product's `stockQty`. Unknown products and products
 * without a finite stock quantity are kept as they are.
 * @param {Array<object>} products
 * @param {Array<string|number>} cartIds
 * @returns {Array<string|number>}
 */
export function limitCartToStock(products, cartIds) {
  const usedByProduct = new Map();
  return cartIds.filter((id) => {
    const product = findCartProduct(products, id);
    const stock = Number(product?.stockQty);
    if (!product || product.stockQty == null || !Number.isFinite(stock)) return true;
    const key = String(product.id ?? product._id ?? product.legacyId);
    const used = usedByProduct.get(key) || 0;
    if (used >= Math.max(0, stock)) return false;
    usedByProduct.set(key, used + 1);
    return true;
  });
}

/**
 * Keep only string/number IDs, turning numeric strings into numbers.
 * @param {unknown} values
 * @returns {Array<string|number>}
 */
export const normalizeCartIds = (values) => (Array.isArray(values) ? values : [])
  .filter((id) => typeof id === "string" || typeof id === "number")
  .map((id) => /^\d+$/.test(String(id)) ? Number(id) : String(id));

/**
 * Expand backend cart lines (`{id, quantity}`) into one ID per unit.
 * @param {Array<{id: string|number, quantity?: number}>} [items]
 * @returns {Array<string|number>}
 */
export function expandCartLines(items) {
  const ids = [];
  (items || []).forEach((item) => {
    const id = item.id;
    for (let i = 0; i < (item.quantity || 1); i += 1) ids.push(id);
  });
  return ids;
}

/**
 * Collapse a cart into backend cart lines (`{id, quantity}`), in first-seen order.
 * @param {Array<string|number>} cartIds
 * @returns {Array<{id: string|number, quantity: number}>}
 */
export function toCartLines(cartIds) {
  const quantities = new Map();
  cartIds.forEach((id) => {
    const key = String(id);
    const entry = quantities.get(key) || { id: /^\d+$/.test(key) ? Number(key) : key, quantity: 0 };
    entry.quantity += 1;
    quantities.set(key, entry);
  });
  return [...quantities.values()];
}

/**
 * Sum of the prices of every unit in the cart (matched by `product.id`).
 * @param {Array<string|number>} cartIds
 * @param {Array<object>} products
 * @returns {number}
 */
export const cartTotal = (cartIds, products) =>
  cartIds.reduce(
    (sum, id) =>
      sum + (products.find((product) => product.id === id)?.price || 0),
    0,
  );
