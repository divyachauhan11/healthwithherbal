import { Package, Star } from "lucide-react";
import { OrderItemRequestStatus } from "./OrderItemRequestStatus";
import { isRequestForOrderItem, orderProductImage } from "./order-utils";

/**
 * One order line: image, title, brand, quantity, optional "Write Review"
 * button, return/exchange status chips and the price breakdown.
 * @param {object} props
 * @param {object} props.item Order line.
 * @param {number} props.index Line position in the order.
 * @param {object[]} [props.returnExchangeRequests] All of the order's return/exchange requests.
 * @param {boolean} props.canReview Show the "Write Review" button (delivered orders).
 * @param {(item: object) => void} props.onReview Opens the review form for the line.
 */
export function OrderItemRow({ item, index, returnExchangeRequests, canReview, onReview }) {
  return (
    <div className="order-placed-item-row">
      <div className="item-icon-box">
        {orderProductImage(item) ? (
          <img
            className="ordered-product-image"
            src={orderProductImage(item)}
            alt={
              item.titleSnapshot || item.title || "Ordered product"
            }
            loading="lazy"
          />
        ) : (
          <Package size={22} />
        )}
      </div>
      <div className="item-text-info">
        <strong className="item-title">
          {item.titleSnapshot || item.title}
        </strong>
        <span className="item-brand">
          {item.brandSnapshot || item.brand || "Health with Herbal"}
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginTop: "6px",
            flexWrap: "wrap",
          }}
        >
          <span className="item-qty-tag">
            Quantity: {item.quantity}
          </span>
          {canReview && (
            <button
              type="button"
              className="item-review-btn"
              onClick={() => onReview(item)}
              title={`Review ${item.titleSnapshot || item.title}`}
            >
              <Star size={13} fill="#f59e0b" color="#f59e0b" />
              <span>Write Review</span>
            </button>
          )}
        </div>
        {(returnExchangeRequests || [])
          .filter((request) => isRequestForOrderItem(request, item, index))
          .map((request) => (
            <OrderItemRequestStatus key={request._id} request={request} />
          ))}
      </div>
      <div className="item-price-col">
        <span className="unit-calc">
          {item.quantity} × ₹{item.unitPrice}
        </span>
        <strong className="line-total-val">
          ₹{item.lineTotal || item.unitPrice * item.quantity}
        </strong>
      </div>
    </div>
  );
}
