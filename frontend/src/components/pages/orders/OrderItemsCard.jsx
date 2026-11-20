import { ORDER_STATUSES } from "@/constants/statuses";
import { DeliveredReviewCallout } from "./DeliveredReviewCallout";
import { OrderItemRow } from "./OrderItemRow";
import { OrderNoteBox } from "./OrderNoteBox";
import { OrderReceiptHeader } from "./OrderReceiptHeader";
import { OrderTotalsBreakdown } from "./OrderTotalsBreakdown";

/**
 * Receipt card of the order page: header, review callout (delivered orders),
 * the order lines, the delivery note and the totals.
 * @param {object} props
 * @param {object} props.order Order being shown.
 * @param {string} props.status Lower-cased live order status.
 * @param {(item: object) => void} props.onReviewItem Opens the review form for a line.
 */
export function OrderItemsCard({ order, status, onReviewItem }) {
  const isDelivered = status === ORDER_STATUSES[3];

  return (
    <div className="order-receipt-card">
      <OrderReceiptHeader itemCount={order.items?.length || 0} status={status} />

      {isDelivered && <DeliveredReviewCallout />}

      <div className="order-items-table">
        {(order.items || []).map((item, idx) => (
          <OrderItemRow
            key={idx}
            item={item}
            index={idx}
            returnExchangeRequests={order.returnExchangeRequests}
            canReview={isDelivered}
            onReview={onReviewItem}
          />
        ))}
      </div>

      {/* Note attached to order */}
      {order.orderNote && <OrderNoteBox note={order.orderNote} />}

      {/* Summary Lines */}
      <OrderTotalsBreakdown order={order} />
    </div>
  );
}
