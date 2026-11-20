import { ArrowDownToLine, Package, Truck, Users } from "lucide-react";
import { currency } from "../global/admin-utils";

/**
 * Stat cards of the Dashboard page: revenue, orders, active products and customers.
 * @param {{stats: Object, onNavigate?: (page: string) => void}} context
 * @returns {Array<Object>} StatCard props.
 */
export function getDashboardStatCards({ stats, onNavigate }) {
  return [
    {
      id: "dash_revenue",
      label: "Revenue",
      value: currency(stats.revenue),
      badge: "All time",
      sub: "All non-cancelled orders",
      tone: "forest",
      icon: ArrowDownToLine,
      onClick: onNavigate ? () => onNavigate("Orders") : undefined,
      hint: onNavigate ? "Orders" : undefined,
    },
    {
      id: "dash_orders",
      label: "Orders",
      value: stats.orderCount ?? 0,
      badge:
        (stats.pendingOrders ?? 0) > 0
          ? `${stats.pendingOrders} pending`
          : "All clear",
      pulseAlert: (stats.pendingOrders ?? 0) > 0,
      sub:
        (stats.pendingOrders ?? 0) > 0
          ? `${stats.pendingOrders} need attention`
          : "All orders fulfilled",
      tone: "amber",
      icon: Truck,
      onClick: onNavigate ? () => onNavigate("Orders") : undefined,
      hint:
        (stats.pendingOrders ?? 0) > 0 && onNavigate ? "Fulfill" : undefined,
    },
    {
      id: "dash_products",
      label: "Active products",
      value: stats.activeProducts ?? 0,
      badge:
        (stats.lowStock ?? 0) > 0 ? `${stats.lowStock} alerts` : "Healthy",
      pulseAlert: (stats.lowStock ?? 0) > 0,
      sub:
        (stats.lowStock ?? 0) > 0
          ? `${stats.lowStock} low stock`
          : "Inventory healthy",
      tone: "gold",
      icon: Package,
      onClick: onNavigate ? () => onNavigate("Products") : undefined,
      hint: onNavigate ? "Products" : undefined,
    },
    {
      id: "dash_customers",
      label: "Customers",
      value: stats.customerCount ?? 0,
      badge:
        (stats.pendingReviews ?? 0) > 0
          ? `${stats.pendingReviews} new`
          : "Registered",
      pulseAlert: (stats.pendingReviews ?? 0) > 0,
      sub:
        (stats.pendingReviews ?? 0) > 0
          ? `${stats.pendingReviews} reviews to approve`
          : "Active customer base",
      tone: "blue",
      icon: Users,
      onClick:
        onNavigate && (stats.pendingReviews ?? 0) > 0
          ? () => onNavigate("Reviews")
          : onNavigate
            ? () => onNavigate("Customers")
            : undefined,
      hint:
        (stats.pendingReviews ?? 0) > 0 && onNavigate
          ? "Moderate"
          : onNavigate
            ? "View buyers"
            : undefined,
    },
  ];
}
