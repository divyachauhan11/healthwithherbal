import { useMemo } from "react";
import { filterLowStockProducts } from "./inventory-alert-utils";

/**
 * Low stock products for the dashboard inventory alert: all of them, the first
 * seven to display and their share of the active catalog.
 * @param {Array<Object>} products Dashboard low stock candidates.
 * @param {number} activeProductCount
 * @returns {{lowStock: Array<Object>, visible: Array<Object>, percentage: number}}
 */
export function useInventoryAlert(products, activeProductCount) {
  const lowStock = useMemo(() => filterLowStockProducts(products), [products]);
  const visible = lowStock.slice(0, 7);
  const percentage = activeProductCount ? Math.round((lowStock.length / activeProductCount) * 100) : 0;
  return { lowStock, visible, percentage };
}
