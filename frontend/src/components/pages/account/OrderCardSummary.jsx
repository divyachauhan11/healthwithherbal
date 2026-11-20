/**
 * Price summary of an account order card: subtotal, shipping, discount and total paid.
 * @param {object} props
 * @param {object} props.order Order with `subtotal`, `shipping`, `discount`, `couponCode` and `total`.
 */
export function OrderCardSummary({ order }) {
  return (
    <div className="order-summary-breakdown">
      <div className="summary-row"><span>Subtotal:</span><span>₹{order.subtotal}</span></div>
      <div className="summary-row"><span>Shipping:</span><span>{order.shipping === 0 ? "FREE" : `₹${order.shipping}`}</span></div>
      {order.discount > 0 && (
        <div className="summary-row discount">
          <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}:</span>
          <span>-₹{order.discount}</span>
        </div>
      )}
      <div className="summary-row grand-total"><span>Total Paid:</span><span className="total-highlight">₹{order.total}</span></div>
    </div>
  );
}
