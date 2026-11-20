import { AlertTriangle, Package, TrendingUp } from "lucide-react";

/**
 * Stat cards of the Low Stock page; each card filters the list by stock level.
 * @param {{targetRows: Array<Object>, activeFilter?: string, onStockFilterChange?: (filter: string) => void}} context
 * @returns {Array<Object>} StatCard props.
 */
export function getLowStockStatCards({ targetRows, activeFilter, onStockFilterChange }) {
  const outOfStockCount = targetRows.filter(
    (item) => Number(item.stockQty ?? 0) === 0,
  ).length;
  const criticalCount = targetRows.filter((item) => {
    const quantity = Number(item.stockQty ?? 0);
    return quantity > 0 && quantity <= 4;
  }).length;
  const warningCount = targetRows.filter((item) => {
    const quantity = Number(item.stockQty ?? 0);
    return quantity >= 5 && quantity < 10;
  }).length;

  return [
    {
      id: "low-stock-all",
      label: "Total low stock",
      value: targetRows.length,
      badge: "All items",
      sub: "Items below their stock threshold",
      tone: "forest",
      icon: Package,
      active: activeFilter === "all",
      onClick: onStockFilterChange ? () => onStockFilterChange("all") : undefined,
      hint: "Show all",
    },
    {
      id: "low-stock-out",
      label: "Out of stock",
      value: outOfStockCount,
      badge: outOfStockCount ? `${outOfStockCount} alerts` : "Clear",
      pulseAlert: outOfStockCount > 0,
      sub: "0 units remaining",
      tone: "amber",
      icon: AlertTriangle,
      active: activeFilter === "out",
      onClick: onStockFilterChange ? () => onStockFilterChange("out") : undefined,
      hint: "Filter",
    },
    {
      id: "low-stock-critical",
      label: "Critical stock",
      value: criticalCount,
      badge: criticalCount ? `${criticalCount} urgent` : "Clear",
      pulseAlert: criticalCount > 0,
      sub: "1 to 4 units left",
      tone: "gold",
      icon: AlertTriangle,
      active: activeFilter === "critical",
      onClick: onStockFilterChange ? () => onStockFilterChange("critical") : undefined,
      hint: "Filter",
    },
    {
      id: "low-stock-warning",
      label: "Warning level",
      value: warningCount,
      badge: warningCount ? `${warningCount} to monitor` : "Clear",
      sub: "5 to 9 units left",
      tone: "blue",
      icon: TrendingUp,
      active: activeFilter === "warning",
      onClick: onStockFilterChange ? () => onStockFilterChange("warning") : undefined,
      hint: "Filter",
    },
  ];
}
