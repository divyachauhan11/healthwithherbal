import { AlertTriangle, Check, EyeOff, FolderTree } from "lucide-react";
import { livePercentage } from "./stats-utils";

/**
 * Stat cards of the Categories page: total (clears the search), active,
 * hidden (toggles the "hidden" filter) and low stock.
 * @param {{stats: Object, targetRows: Array<Object>, query: string, setQuery?: (query: string) => void, onNavigate?: (page: string) => void}} context
 * @returns {Array<Object>} StatCard props.
 */
export function getCategoryStatCards({ stats, targetRows, query, setQuery, onNavigate }) {
  const totalCategories = targetRows.length;
  const activeCategories = targetRows.filter(
    (c) => c.isActive !== false,
  ).length;
  const activePct = livePercentage(activeCategories, totalCategories);
  const hiddenCategories = targetRows.filter(
    (c) => c.isActive === false,
  );
  const isHiddenFiltered = query.trim().toLowerCase() === "hidden";
  const lowStockCount = stats.lowStock ?? 0;

  return [
    {
      id: "cat_all",
      label: "Categories",
      value: totalCategories,
      badge: query ? "Filtered" : "All items",
      pulseAlert: Boolean(query),
      sub: query ? `Filter: "${query}"` : "Total in catalog",
      tone: "forest",
      icon: FolderTree,
      onClick: query && setQuery ? () => setQuery("") : undefined,
      hint: query ? "Clear" : undefined,
    },
    {
      id: "cat_active",
      label: "Active",
      value: activeCategories,
      badge: `${activePct}% live`,
      pulseDot: true,
      sub: "Storefront visible",
      tone: "emerald",
      icon: Check,
    },
    {
      id: "cat_hidden",
      label: "Hidden",
      value: hiddenCategories.length,
      badge: isHiddenFiltered
        ? "Active filter"
        : `${hiddenCategories.length} hidden`,
      pulseAlert: hiddenCategories.length > 0,
      sub: "Paused from storefront",
      tone: "amber",
      icon: EyeOff,
      onClick: setQuery
        ? () => setQuery(isHiddenFiltered ? "" : "hidden")
        : undefined,
      hint: isHiddenFiltered ? "Clear" : "Filter",
    },
    {
      id: "cat_low_stock",
      label: "Low stock",
      value: lowStockCount,
      badge: lowStockCount > 0 ? `${lowStockCount} alerts` : "Healthy",
      pulseAlert: lowStockCount > 0,
      sub:
        lowStockCount > 0
          ? `${lowStockCount} items need reorder`
          : "Inventory healthy",
      tone: "gold",
      icon: AlertTriangle,
      onClick: onNavigate ? () => onNavigate("Low Stock") : undefined,
      hint: onNavigate ? "Restock →" : undefined,
    },
  ];
}
