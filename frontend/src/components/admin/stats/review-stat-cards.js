import { AlertTriangle, Check, Package, TrendingUp } from "lucide-react";

/**
 * Stat cards of the Reviews page: reviews, pending approval, products and reviewers.
 * @param {{stats: Object, onNavigate?: (page: string) => void}} context
 * @returns {Array<Object>} StatCard props.
 */
export function getReviewStatCards({ stats, onNavigate }) {
  return [
    {
      id: "rev_all",
      label: "Reviews",
      value: stats.reviewCount ?? 0,
      badge: "Feedback",
      sub: "Customer opinions",
      tone: "forest",
      icon: Package,
    },
    {
      id: "rev_pending",
      label: "Awaiting approval",
      value: stats.pendingReviews ?? 0,
      badge:
        (stats.pendingReviews ?? 0) > 0
          ? `${stats.pendingReviews} new`
          : "Clean",
      pulseAlert: (stats.pendingReviews ?? 0) > 0,
      sub:
        (stats.pendingReviews ?? 0) > 0
          ? "Needs moderation"
          : "All reviews processed",
      tone: "amber",
      icon: AlertTriangle,
    },
    {
      id: "rev_products",
      label: "Products",
      value: stats.productCount ?? 0,
      badge: "Catalog",
      sub: "Reviewed products",
      tone: "blue",
      icon: Check,
      onClick: onNavigate ? () => onNavigate("Products") : undefined,
      hint: onNavigate ? "Products →" : undefined,
    },
    {
      id: "rev_customers",
      label: "Customers",
      value: stats.customerCount ?? 0,
      badge: "Reviewers",
      sub: "Contributing buyers",
      tone: "gold",
      icon: TrendingUp,
      onClick: onNavigate ? () => onNavigate("Customers") : undefined,
      hint: onNavigate ? "Customers →" : undefined,
    },
  ];
}
