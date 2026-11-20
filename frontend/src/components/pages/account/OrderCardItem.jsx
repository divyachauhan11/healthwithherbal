import { OrderCardItemActions } from "./OrderCardItemActions";
import { OrderItemReturnBadge } from "./OrderItemReturnBadge";
import { OrderItemThumbnail } from "./OrderItemThumbnail";
import { returnRequestMatchesItem } from "./account-utils";

/**
 * One line of an account order card: thumbnail, title, brand, quantity,
 * return/exchange status and the price/actions column.
 * @param {object} props
 * @param {object} props.item Order line.
 * @param {number} props.index Line position in the order.
 * @param {object} props.order Order the line belongs to.
 * @param {boolean} props.isDelivered Order has been delivered.
 * @param {(item: object, order: object) => void} [props.onReviewProduct] Opens the review form.
 * @param {(item: object, order: object, itemIndex: number) => void} [props.onRequestReturnExchange] Opens the return/exchange form.
 * @param {string[]} props.returnExchangeStatuses Return/exchange status values.
 * @param {string[]} props.returnExchangeTypes Return/exchange type values.
 */
export function OrderCardItem({
  item,
  index,
  order,
  isDelivered,
  onReviewProduct,
  onRequestReturnExchange,
  returnExchangeStatuses,
  returnExchangeTypes,
}) {
  const requests = (order.returnExchangeRequests || [])
    .filter((request) => returnRequestMatchesItem(request, item, index));

  return (
    <div className="order-item-detailed">
      <OrderItemThumbnail item={item} />
      <div className="order-item-info">
        <div className="item-title">{item.title}</div>
        <div className="item-brand">{item.brand || "Health with Herbal"}</div>
        <div className="item-qty">Qty: {item.quantity}</div>
        {requests.map((request) => (
          <OrderItemReturnBadge
            key={request._id}
            request={request}
            defaultStatus={returnExchangeStatuses[0]}
            exchangeType={returnExchangeTypes[1]}
          />
        ))}
      </div>
      <OrderCardItemActions
        item={item}
        isDelivered={isDelivered}
        hasRequest={requests.length > 0}
        onReview={() => onReviewProduct?.(item, order)}
        onRequestReturnExchange={() => onRequestReturnExchange?.(item, order, index)}
      />
    </div>
  );
}
