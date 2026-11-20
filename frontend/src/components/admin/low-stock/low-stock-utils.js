/** Stock threshold used for products without their own `lowStockThreshold`. */
export const DEFAULT_LOW_STOCK_THRESHOLD = 10;

/**
 * Stock band of a product, as used by the low-stock filter cards.
 * @param {object} product
 * @returns {"out"|"critical"|"warning"|"healthy"}
 */
export function getStockCategory(product) {
  const quantity = Number(product.stockQty ?? 0);
  if (quantity === 0) return "out";
  if (quantity <= 4) return "critical";
  if (quantity < 10) return "warning";
  return "healthy";
}

/**
 * Whether a product is at or below its low-stock threshold.
 * @param {object} product
 * @returns {boolean}
 */
export function isLowStockProduct(product) {
  const quantity = Number(product.stockQty ?? 0);
  const threshold =
    product.lowStockThreshold !== undefined &&
    product.lowStockThreshold !== null
      ? Number(product.lowStockThreshold)
      : DEFAULT_LOW_STOCK_THRESHOLD;
  return quantity <= threshold;
}

/**
 * Low-stock products in a stock band ("all" for every band) matching a search query
 * (title, SKU, category or brand).
 * @param {Array<object>} products
 * @param {string} stockFilter
 * @param {string} query
 * @returns {Array<object>}
 */
export function filterLowStockProducts(products, stockFilter, query) {
  let filtered = products;
  if (stockFilter !== "all") {
    filtered = filtered.filter(
      (product) => getStockCategory(product) === stockFilter,
    );
  }

  const search = query.trim().toLowerCase();
  if (!search) return filtered;
  return filtered.filter(
    (product) =>
      product.title?.toLowerCase().includes(search) ||
      product.sku?.toLowerCase().includes(search) ||
      product.category?.toLowerCase().includes(search) ||
      product.brand?.toLowerCase().includes(search),
  );
}

/**
 * Badge severity and label for a stock quantity.
 * @param {number} quantity
 * @returns {{severity: "out"|"critical"|"low", label: "OUT"|"CRITICAL"|"LOW"}}
 */
export function getStockBadge(quantity) {
  const severity = quantity === 0
    ? "out"
    : quantity <= 4
      ? "critical"
      : "low";
  const label = quantity === 0
    ? "OUT"
    : quantity <= 4
      ? "CRITICAL"
      : "LOW";
  return { severity, label };
}
