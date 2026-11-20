import { classStatus } from "../../global/admin-utils";
import { OrderSummaryTile } from "./OrderSummaryTile";
import { formatPaymentMethod, getPaymentStatusLabel } from "./order-utils";

/**
 * Status, payment and tracking overview tiles of an order.
 * @param {{order: Object}} props
 */
export function OrderDetailsSummary({ order }) {
  return (
    <div className="order-detail-summary-grid">
      <OrderSummaryTile label="Order status" valueClassName={`order-detail-status ${classStatus(order.status)}`}>{order.status || "—"}</OrderSummaryTile>
      <OrderSummaryTile label="Payment method">{formatPaymentMethod(order)}</OrderSummaryTile>
      <OrderSummaryTile label="Payment status">{getPaymentStatusLabel(order)}</OrderSummaryTile>
      <OrderSummaryTile label="Tracking ID">{order.trackingId || "Not assigned"}</OrderSummaryTile>
    </div>
  );
}
