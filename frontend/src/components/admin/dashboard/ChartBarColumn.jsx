import { currency } from "../global/admin-utils";
import { ChartBarTooltip } from "./ChartBarTooltip";

/**
 * One day's revenue bar (or a zero marker) scaled to the chart ceiling.
 * @param {{day: {date: Date, revenue: number, orders: number}, ceiling: number}} props
 */
export function ChartBarColumn({ day, ceiling }) {
  const height = Math.min(100, (day.revenue / (ceiling || 1)) * 100);
  const label = day.date.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
  return <div className="chart-bar-column"><div className="chart-bar-slot">{height > 0 ? <div className="chart-bar-fill" style={{ height: `${height}%` }} tabIndex={0} aria-label={`${label}: ${currency(day.revenue, "INR")}, ${day.orders} orders`}><ChartBarTooltip day={day} label={label} /></div> : <div className="chart-bar-zero" tabIndex={0} aria-label={`${label}: ${currency(day.revenue, "INR")}, ${day.orders} ${day.orders === 1 ? "order" : "orders"}`}><ChartBarTooltip day={day} label={label} /></div>}</div></div>;
}
