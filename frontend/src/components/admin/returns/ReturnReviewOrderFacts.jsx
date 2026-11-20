import { dateLabel } from "@/components/admin/global/admin-utils";
import { getOrderCustomerName } from "./returns-utils";

/**
 * Key facts of the order linked to a request (number, dates, contact, payment, coupon, tracking).
 * @param {{request: object, order: object}} props
 */
export function ReturnReviewOrderFacts({ request, order }) {
  const orderCustomer = getOrderCustomerName(order, request);

  return (
    <div className="return-review-order-grid">
      <article><span>Order number</span><strong>#{order.orderNumber || request.orderNumber}</strong></article>
      <article><span>Placed</span><strong>{dateLabel(order.createdAt)}</strong></article>
      <article><span>Customer</span><strong>{orderCustomer}</strong><small>{order.customer?.email || order.guestEmail || request.customer?.email || "—"}</small></article>
      <article><span>Phone</span><strong>{order.shippingAddress?.phone || order.customer?.phone || "—"}</strong></article>
      <article><span>Payment method</span><strong>{String(order.paymentMethod || "Cash on delivery").replaceAll("_", " ")}</strong></article>
      <article><span>Payment status</span><strong>{order.paymentStatus || (order.paymentMethod === "cash_on_delivery" ? "Due on delivery" : "See payment records")}</strong></article>
      <article><span>Coupon applied</span><strong>{order.couponCode || "No coupon"}</strong></article>
      <article><span>Tracking ID</span><strong>{order.trackingId || "Not assigned"}</strong></article>
    </div>
  );
}
