import { currency } from "../global/admin-utils";

/**
 * "Last 7 days · ₹total" label in the sales chart header.
 * @param {{total: number}} props
 */
export function SalesChartPeriod({ total }) {
  return <span className="panel-period">Last 7 days{total ? ` · ${currency(total, "INR")}` : ""}</span>;
}
