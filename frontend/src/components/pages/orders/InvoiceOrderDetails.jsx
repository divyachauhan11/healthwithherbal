import { ORDER_STATUSES } from "@/constants/statuses";
import { InvoiceInfoCard } from "./InvoiceInfoCard";
import { invoiceDate } from "./invoice-utils";

/**
 * "Order details" card: invoice and order dates, order number, status,
 * payment method and tracking id.
 * @param {object} props
 * @param {object} props.order Invoiced order.
 */
export function InvoiceOrderDetails({ order }) {
  return (
    <InvoiceInfoCard title="Order details">
      <dt>Invoice date</dt><dd>{invoiceDate(order.updatedAt || order.createdAt)}</dd>
      <dt>Order number</dt><dd>{order.orderNumber || "—"}</dd>
      <dt>Order date</dt><dd>{invoiceDate(order.createdAt)}</dd>
      <dt>Order status</dt><dd>{String(order.status || ORDER_STATUSES[0]).toUpperCase()}</dd>
      <dt>Payment method</dt><dd>{order.paymentMethod === "cash_on_delivery" ? "Cash on Delivery" : order.paymentMethod || "—"}</dd>
      {order.trackingId && <><dt>Tracking ID</dt><dd>{order.trackingId}</dd></>}
    </InvoiceInfoCard>
  );
}
