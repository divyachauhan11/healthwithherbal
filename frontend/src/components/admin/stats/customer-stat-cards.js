import { Check, Package, TrendingUp, Truck } from "lucide-react";
import { currency } from "../global/admin-utils";

/**
 * Stat cards of the Customers page: customers, orders, revenue and reviews.
 * @param {{stats: Object, onNavigate?: (page: string) => void}} context
 * @returns {Array<Object>} StatCard props.
 */
export function getCustomerStatCards({ stats, onNavigate }) {
  return [
    {
      id: "cust_all",
      label: "Customers",
      value: stats.customerCount ?? 0,
      badge: "Store buyers",
      sub: "Total unique shoppers",
      tone: "forest",
      icon: Package,
    },
    {
      id: "cust_orders",
      label: "Total orders",
      value: stats.orderCount ?? 0,
      badge: "Purchases",
      sub: "Orders placed",
      tone: "emerald",
      icon: Truck,
      onClick: onNavigate ? () => onNavigate("Orders") : undefined,
      hint: onNavigate ? "Orders →" : undefined,
    },
    {
      id: "cust_rev",
      label: "Revenue",
      value: currency(stats.revenue),
      badge: "Lifetime value",
      sub: "Total customer spend",
      tone: "gold",
      icon: TrendingUp,
    },
    {
      id: "cust_revs",
      label: "Reviews",
      value: stats.reviewCount ?? 0,
      badge: "Feedback",
      sub: "Ratings submitted",
      tone: "blue",
      icon: Check,
      onClick: onNavigate ? () => onNavigate("Reviews") : undefined,
      hint: onNavigate ? "Reviews →" : undefined,
    },
  ];
}
