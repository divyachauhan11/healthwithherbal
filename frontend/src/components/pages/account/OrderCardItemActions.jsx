import { CheckCircle2, RotateCcw, Star } from "lucide-react";

/**
 * Price column of an account order line, with review and return/exchange
 * actions once the order is delivered.
 * @param {object} props
 * @param {object} props.item Order line.
 * @param {boolean} props.isDelivered Order has been delivered.
 * @param {boolean} props.hasRequest A return/exchange request exists for the line.
 * @param {() => void} props.onReview Opens the review form for the line.
 * @param {() => void} props.onRequestReturnExchange Opens the return/exchange form for the line.
 */
export function OrderCardItemActions({ item, isDelivered, hasRequest, onReview, onRequestReturnExchange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
      <div className="order-item-price">₹{item.lineTotal || item.unitPrice * item.quantity}</div>
      {isDelivered && (
        <>
          <button type="button" className="item-review-btn" onClick={onReview} title={`Review ${item.title}`}>
            <Star size={12} fill="#f59e0b" color="#f59e0b" />
            <span>Review Product</span>
          </button>
          {hasRequest ? (
            <span className="item-review-btn return-exchange-request-btn is-submitted" aria-label="Return or exchange request already submitted">
              <CheckCircle2 size={13} />
              <span>Request submitted</span>
            </span>
          ) : (
            <button type="button" className="item-review-btn return-exchange-request-btn" onClick={onRequestReturnExchange}>
              <RotateCcw size={13} />
              <span>Request Return / Exchange</span>
            </button>
          )}
        </>
      )}
    </div>
  );
}
