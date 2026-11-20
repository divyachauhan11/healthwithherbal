import { currency } from "../global/admin-utils";

/**
 * Hover/focus tooltip of a chart bar: revenue, orders and date.
 * @param {{day: {revenue: number, orders: number}, label: string}} props
 */
export function ChartBarTooltip({ day, label }) {
  return <div className="chart-bar-tooltip"><span className="tooltip-amount">{currency(day.revenue, "INR")}</span><span className="tooltip-sub">{day.orders} {day.orders === 1 ? "order" : "orders"} · {label}</span></div>;
}
