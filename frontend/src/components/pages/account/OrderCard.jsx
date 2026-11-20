import { OrderCardFooter } from "./OrderCardFooter";
import { OrderCardHeader } from "./OrderCardHeader";
import { OrderCardItem } from "./OrderCardItem";
import { OrderCardSummary } from "./OrderCardSummary";
import { OrderDeliveredNotice } from "./OrderDeliveredNotice";

/**
 * Collapsible order card of the account page: header, delivered callout,
 * order lines (with review and return/exchange actions), price summary and
 * delivery/payment footer. Status values come from the host app.
 * @param {object} props
 * @param {object} props.order Order to show.
 * @param {boolean} props.isExpanded Card is expanded.
 * @param {() => void} props.onToggle Expands or collapses the card.
 * @param {(order: object) => void} [props.onViewOrder] Opens the order details page.
 * @param {(item: object, order: object) => void} [props.onReviewProduct] Opens the review form.
 * @param {(item: object, order: object, itemIndex: number) => void} [props.onRequestReturnExchange] Opens the return/exchange form.
 * @param {string[]} props.orderStatuses Order status values (index 0 placed, 3 delivered).
 * @param {string[]} props.returnExchangeStatuses Return/exchange status values (index 0 pending).
 * @param {string[]} props.returnExchangeTypes Return/exchange type values (index 1 exchange).
 */
export function OrderCard({
  order,
  isExpanded,
  onToggle,
  onViewOrder,
  onReviewProduct,
  onRequestReturnExchange,
  orderStatuses,
  returnExchangeStatuses,
  returnExchangeTypes,
}) {
  const isDelivered = (order.status || "").toLowerCase() === orderStatuses[3];

  return (
    <div className={`account-order-card full-order-card ${isExpanded ? "" : "is-collapsed"}`}>
      <OrderCardHeader
        order={order}
        isExpanded={isExpanded}
        onToggle={onToggle}
        defaultStatus={orderStatuses[0]}
      />

      {isDelivered && <OrderDeliveredNotice />}

      <div className="order-items-grid">
        {(order.items || []).map((item, idx) => (
          <OrderCardItem
            key={idx}
            item={item}
            index={idx}
            order={order}
            isDelivered={isDelivered}
            onReviewProduct={onReviewProduct}
            onRequestReturnExchange={onRequestReturnExchange}
            returnExchangeStatuses={returnExchangeStatuses}
            returnExchangeTypes={returnExchangeTypes}
          />
        ))}
      </div>

      <OrderCardSummary order={order} />

      <OrderCardFooter order={order} onViewOrder={onViewOrder} />
    </div>
  );
}
