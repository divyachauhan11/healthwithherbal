/**
 * Rows the page statistics summarise: every row of the page, else the
 * filtered rows, else (for Categories/Brands) the catalog lists.
 * @param {{page: string, rows: Array<Object>, allRows: Array<Object>, catalog?: Object}} options
 * @returns {Array<Object>}
 */
export function resolveStatsRows({ page, rows, allRows, catalog }) {
  return allRows.length
    ? allRows
    : rows.length
      ? rows
      : page === "Categories"
        ? catalog?.categories || []
        : page === "Brands"
          ? catalog?.brands || []
          : [];
}

/**
 * Inventory value, unit totals and stock health buckets for a list of products.
 * @param {Array<Object>} targetRows Products (price, stockQty).
 * @returns {{inventoryVal: number, totalUnits: number, outOfStockItems: Array<Object>, criticalStockItems: Array<Object>, safeStockItems: Array<Object>, avgUnitPrice: number, totalSkus: number}}
 */
export function summarizeInventory(targetRows) {
  const inventoryVal = targetRows.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.stockQty || 0),
    0,
  );
  const totalUnits = targetRows.reduce(
    (sum, item) => sum + Number(item.stockQty || 0),
    0,
  );
  const outOfStockItems = targetRows.filter(
    (item) => Number(item.stockQty || 0) === 0,
  );
  const criticalStockItems = targetRows.filter(
    (item) => Number(item.stockQty || 0) > 0 && Number(item.stockQty || 0) <= 4,
  );
  const safeStockItems = targetRows.filter(
    (item) => Number(item.stockQty || 0) >= 5,
  );
  const avgUnitPrice =
    targetRows.length > 0
      ? targetRows.reduce((sum, item) => sum + Number(item.price || 0), 0) /
        targetRows.length
      : 0;

  return {
    inventoryVal,
    totalUnits,
    outOfStockItems,
    criticalStockItems,
    safeStockItems,
    avgUnitPrice,
    totalSkus: targetRows.length,
  };
}

/**
 * Share of `part` in `total` as a whole percentage (100 when total is 0).
 * @param {number} part
 * @param {number} total
 * @returns {number}
 */
export const livePercentage = (part, total) =>
  total > 0 ? Math.round((part / total) * 100) : 100;
