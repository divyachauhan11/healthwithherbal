import { AlertTriangle, Check, Package, TrendingUp } from "lucide-react";
import { currency } from "../global/admin-utils";
import { livePercentage } from "./stats-utils";

/**
 * Stat cards of the Products page: catalog size, active share, low stock and
 * inventory value (which opens the valuation breakdown).
 * @param {{stats: Object, targetRows: Array<Object>, inventory: Object, onNavigate?: (page: string) => void, openValuation: () => void}} context
 * @returns {Array<Object>} StatCard props.
 */
export function getProductStatCards({ stats, targetRows, inventory, onNavigate, openValuation }) {
  const totalCatalogCount = stats.productCount || targetRows.length;
  const activeCount =
    stats.activeProducts ?? targetRows.filter((p) => p.active !== false).length;
  const activePct = livePercentage(activeCount, totalCatalogCount);

  return [
    {
      id: "prod_all",
      label: "Products",
      value: totalCatalogCount,
      badge: "All items",
      sub: "Total in catalog",
      tone: "forest",
      icon: Package,
    },
    {
      id: "prod_active",
      label: "Active",
      value: activeCount,
      badge: `${activePct}% live`,
      pulseDot: true,
      sub: "Storefront visible",
      tone: "emerald",
      icon: Check,
    },
    {
      id: "prod_low_stock",
      label: "Low stock",
      value: stats.lowStock ?? 0,
      badge:
        (stats.lowStock ?? 0) > 0 ? `${stats.lowStock} alerts` : "Healthy",
      pulseAlert: (stats.lowStock ?? 0) > 0,
      sub: (stats.lowStock ?? 0) > 0 ? "Needs replenishment" : "Stock safe",
      tone: "amber",
      icon: AlertTriangle,
      onClick:
        (stats.lowStock ?? 0) > 0 && onNavigate
          ? () => onNavigate("Low Stock")
          : undefined,
      hint: (stats.lowStock ?? 0) > 0 && onNavigate ? "Restock" : undefined,
    },
    {
      id: "prod_value",
      label: "Inventory value",
      value: currency(inventory.inventoryVal),
      badge: `${inventory.totalUnits.toLocaleString()} units`,
      sub: "Warehouse retail worth",
      tone: "gold",
      icon: TrendingUp,
      onClick: openValuation,
      hint: "Breakdown",
    },
  ];
}
