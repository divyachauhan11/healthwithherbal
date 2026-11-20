/**
 * Customer city and country of an order, or a dash when unknown.
 * @param {{order: Object}} props
 */
export function OrderAddressCell({ order }) {
  return order.customer?.city || order.customer?.country ? (
    <span>
      {order.customer?.city ? `${order.customer.city}, ` : ""}
      {order.customer?.country || ""}
    </span>
  ) : (
    <span className="muted">—</span>
  );
}
