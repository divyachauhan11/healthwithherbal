/**
 * Order number link that opens the order details view.
 * @param {{order: Object, onView: (order: Object) => void}} props
 */
export function OrderNumberButton({ order, onView }) {
  return (
    <button
      type="button"
      className="order-number-link"
      onClick={() => onView(order)}
      aria-label={`View order ${order.orderNumber} details`}
    >
      #{order.orderNumber}
    </button>
  );
}
