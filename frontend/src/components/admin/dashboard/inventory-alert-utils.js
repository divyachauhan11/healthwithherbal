/**
 * Products at or below their low stock threshold (10 units by default).
 * @param {Array<Object>} products
 * @returns {Array<Object>}
 */
export const filterLowStockProducts = (products) =>
  products.filter((product) => Number(product.stockQty ?? 0) <= Number(product.lowStockThreshold ?? 10));

/**
 * Panel description for the inventory alert.
 * @param {number} lowStockCount
 * @param {number} percentage Share of the active catalog.
 * @returns {string}
 */
export const getInventoryAlertSummary = (lowStockCount, percentage) =>
  lowStockCount
    ? `${lowStockCount} items (${percentage}% of active catalog) need attention`
    : "All active products are healthy and well-stocked";

/**
 * Stock level of one product relative to its threshold.
 * @param {Object} product
 * @returns {{quantity: number, threshold: number, out: boolean, remaining: number}}
 */
export const getStockLevel = (product) => {
  const quantity = Number(product.stockQty ?? 0);
  const threshold = Number(product.lowStockThreshold ?? 10);
  const out = quantity === 0;
  const remaining = out ? 0 : Math.min(100, Math.round((quantity / (threshold || 1)) * 100));
  return { quantity, threshold, out, remaining };
};
