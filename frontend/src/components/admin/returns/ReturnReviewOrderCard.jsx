import { RETURN_EXCHANGE_STATUSES } from "@/constants/statuses";
import { ReturnReviewOrderAddresses } from "./ReturnReviewOrderAddresses";
import { ReturnReviewOrderFacts } from "./ReturnReviewOrderFacts";
import { ReturnReviewOrderItems } from "./ReturnReviewOrderItems";
import { ReturnReviewOrderTotals } from "./ReturnReviewOrderTotals";
import { ReturnReviewPaymentRecords } from "./ReturnReviewPaymentRecords";
import { ReturnReviewSectionHeading } from "./ReturnReviewSectionHeading";
import { ReturnStatusBadge } from "./ReturnStatusBadge";

/**
 * "Order overview" section: complete details of the order linked to a request, or a
 * notice when the order cannot be found.
 * @param {{request: object}} props `request.order` is the linked order.
 */
export function ReturnReviewOrderCard({ request }) {
  const order = request.order;

  return (
    <section className="return-review-order-card">
      <ReturnReviewSectionHeading eyebrow="Order overview" title="Complete order details"><ReturnStatusBadge status={order?.status || RETURN_EXCHANGE_STATUSES[0]} label={order?.status || "Order unavailable"} /></ReturnReviewSectionHeading>
      {order ? <>
        <ReturnReviewOrderFacts request={request} order={order} />
        <ReturnReviewOrderAddresses request={request} order={order} />
        <ReturnReviewOrderItems request={request} order={order} />
        <ReturnReviewOrderTotals order={order} />
        <ReturnReviewPaymentRecords request={request} order={order} />
        {order.orderNote && <p className="return-review-order-note"><strong>Customer order note:</strong> {order.orderNote}</p>}
      </> : <p className="return-review-order-missing">The linked order could not be found.</p>}
    </section>
  );
}
