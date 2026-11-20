import { ReturnReviewOrderItem } from "./ReturnReviewOrderItem";
import { isRequestedOrderItem } from "./returns-utils";

/**
 * Every item of the linked order, with a note about which item the request covers.
 * @param {{request: object, order: object}} props
 */
export function ReturnReviewOrderItems({ request, order }) {
  return (
    <div className="return-review-order-items">
      <h4>All order items</h4>
      <p className="return-review-order-items-help">This request is for {request.quantity || 1} × {request.item?.title || "the requested product"}. The list below shows every item in the original order.</p>
      {(order.items || []).length ? order.items.map((item, index) => (
        <ReturnReviewOrderItem
          key={`${item.product || item.legacyId || index}`}
          item={item}
          order={order}
          isRequested={isRequestedOrderItem(item, request)}
        />
      )) : <p>No item details available.</p>}
    </div>
  );
}
