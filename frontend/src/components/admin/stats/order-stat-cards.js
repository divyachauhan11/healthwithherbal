import { AlertTriangle, Package, TrendingUp, Truck } from "lucide-react";
import { currency } from "../global/admin-utils";

/**
 * Stat cards of the Orders page: total, pending, customers and revenue.
 * @param {{stats: Object, onNavigate?: (page: string) => void}} context
 * @returns {Array<Object>} StatCard props.
 */
export function getOrderStatCards({ stats, onNavigate }) {
  return [
    {
      id: "orders_all",
      label: "Total orders",
      value: stats.orderCount ?? 0,
      badge: "All time",
      sub: "Across all channels",
      tone: "forest",
      icon: Truck,
    },
    {
      id: "orders_pending",
      label: "Needs attention",
      value: stats.pendingOrders ?? 0,
      badge:
        (stats.pendingOrders ?? 0) > 0
          ? `${stats.pendingOrders} pending`
          : "All clear",
      pulseAlert: (stats.pendingOrders ?? 0) > 0,
      sub:
        (stats.pendingOrders ?? 0) > 0
          ? "Awaiting fulfillment"
          : "All orders fulfilled",
      tone: "amber",
      icon: AlertTriangle,
    },
    {
      id: "orders_customers",
      label: "Customers",
      value: stats.customerCount ?? 0,
      badge: "Registered",
      sub: "Active customer base",
      tone: "blue",
      icon: Package,
      onClick: onNavigate ? () => onNavigate("Customers") : undefined,
      hint: onNavigate ? "View buyers →" : undefined,
    },
    {
      id: "orders_revenue",
      label: "Revenue",
      value: currency(stats.revenue),
      badge: "Gross sales",
      sub: "All verified orders",
      tone: "gold",
      icon: TrendingUp,
    },
  ];
}
