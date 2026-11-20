import { toFixedAmount } from "./order-utils";

/**
 * Subtotal, shipping, coupon discount and grand total of an order.
 * @param {object} props
 * @param {object} props.order Order with `subtotal`, `shipping`, `discount`, `couponCode` and `total`.
 */
export function OrderTotalsBreakdown({ order }) {
  return (
    <div className="order-totals-breakdown">
      <div className="totals-line">
        <span>Subtotal</span>
        <strong>
          ₹
          {toFixedAmount(order.subtotal)}
        </strong>
      </div>
      <div className="totals-line">
        <span>Shipping Fee</span>
        <strong>
          {order.shipping === 0
            ? "FREE"
            : `₹${order.shipping}`}
        </strong>
      </div>
      {order.discount > 0 && (
        <div className="totals-line discount">
          <span>
            Discount Applied{" "}
            {order.couponCode
              ? `(${order.couponCode})`
              : ""}
          </span>
          <strong>-₹{order.discount}</strong>
        </div>
      )}
      <div className="totals-line grand-total">
        <span>Total Amount</span>
        <span className="grand-total-amount">
          ₹
          {toFixedAmount(order.total)}
        </span>
      </div>
    </div>
  );
}
