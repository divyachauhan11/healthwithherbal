import { dateTimeLabel } from "@/components/admin/global/admin-utils";
import { PaymentDetailSectionTitle } from "./PaymentDetailSectionTitle";
import { PaymentOrderItems } from "./PaymentOrderItems";
import { PaymentOrderTotals } from "./PaymentOrderTotals";

/**
 * "Order" section of the payment details dialog: order facts, items, totals and note.
 * @param {{payment: object, order: object}} props
 */
export function PaymentOrderSection({ payment, order }) {
  return (
    <section className="payment-detail-section">
      <PaymentDetailSectionTitle index="02" title="Order" description="Items, discount, and fulfillment" />
      <div className="payment-detail-facts">
        <article><span>Order number</span><strong>#{order.orderNumber || payment.orderNumber || "—"}</strong></article>
        <article><span>Order status</span><strong className="capitalize">{order.status || payment.orderStatus || "—"}</strong></article>
        <article><span>Placed</span><strong>{dateTimeLabel(order.createdAt)}</strong></article>
        <article><span>Tracking</span><strong>{order.trackingId || "Not assigned"}</strong></article>
      </div>
      <PaymentOrderItems order={order} />
      <PaymentOrderTotals payment={payment} order={order} />
      {order.orderNote && <p className="payment-detail-note"><strong>Order note:</strong> {order.orderNote}</p>}
    </section>
  );
}
