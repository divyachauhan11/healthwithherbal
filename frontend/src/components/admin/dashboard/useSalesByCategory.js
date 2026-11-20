import { useMemo, useState } from "react";
import {
  buildCategoryGradient,
  calculateCategoryBreakdown,
  formatCompactAmount,
} from "./sales-by-category-utils";

const NO_SALES = Object.freeze([]);

/**
 * Owns the sales-by-category widget: the "This month" / "All time" mode and
 * the breakdown, total and donut gradient for that mode. Falls back to all
 * time sales, then to catalog categories, when a period has no data.
 * @param {Object} [dashboard] Dashboard API payload.
 * @returns {{mode: "month"|"all", setMode: Function, items: Array<Object>, displayTotal: string, conicGradient: string}}
 */
export function useSalesByCategory(dashboard) {
  const [mode, setMode] = useState("month");

  const monthRaw = dashboard?.monthSalesByCategory || NO_SALES;
  const allRaw = dashboard?.salesByCategory || NO_SALES;
  const catalogRaw = dashboard?.catalogCategories || NO_SALES;

  const monthItems = useMemo(() => {
    if (monthRaw.length) return calculateCategoryBreakdown(monthRaw);
    if (allRaw.length) return calculateCategoryBreakdown(allRaw);
    return calculateCategoryBreakdown(catalogRaw);
  }, [monthRaw, allRaw, catalogRaw]);

  const allItems = useMemo(() => {
    if (allRaw.length) return calculateCategoryBreakdown(allRaw);
    return calculateCategoryBreakdown(catalogRaw);
  }, [allRaw, catalogRaw]);

  const items = mode === "all" ? allItems : monthItems;

  const monthTotal =
    dashboard?.stats?.monthRevenue ??
    monthRaw.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const allTotal =
    dashboard?.stats?.revenue ??
    allRaw.reduce((sum, item) => sum + (item.revenue || 0), 0);

  const displayTotal = formatCompactAmount(mode === "all" ? allTotal : monthTotal);

  const conicGradient = useMemo(() => buildCategoryGradient(items), [items]);

  return { mode, setMode, items, displayTotal, conicGradient };
}
