import { ORDER_STATUSES, RETURN_EXCHANGE_STATUSES, RETURN_EXCHANGE_TYPES } from "@/constants/statuses";
import { OrderCard } from "./OrderCard";

/**
 * List of collapsible account order cards.
 * @param {object} props
 * @param {object[]} props.orders Orders to show.
 * @param {string} props.className List class (preview or full list).
 * @param {Record<string, boolean>} props.expandedOrders Expanded state by order `_id`.
 * @param {(orderId: string) => void} props.onToggleOrder Expands or collapses an order.
 * @param {(order: object) => void} [props.onViewOrder] Opens the order details page.
 * @param {(item: object, order: object) => void} props.onReviewProduct Opens the review form.
 * @param {(item: object, order: object, itemIndex: number) => void} props.onRequestReturnExchange Opens the return/exchange form.
 */
export function AccountOrderList({
  orders,
  className,
  expandedOrders,
  onToggleOrder,
  onViewOrder,
  onReviewProduct,
  onRequestReturnExchange,
}) {
  return (
    <div className={className}>
      {orders.map((order) => (
        <OrderCard
          key={order._id}
          order={order}
          orderStatuses={ORDER_STATUSES}
          returnExchangeStatuses={RETURN_EXCHANGE_STATUSES}
          returnExchangeTypes={RETURN_EXCHANGE_TYPES}
          isExpanded={Boolean(expandedOrders[order._id])}
          onToggle={() => onToggleOrder(order._id)}
          onViewOrder={onViewOrder}
          onReviewProduct={onReviewProduct}
          onRequestReturnExchange={onRequestReturnExchange}
        />
      ))}
    </div>
  );
}
