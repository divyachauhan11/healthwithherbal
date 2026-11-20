/**
 * Customer name and email of an order.
 * @param {{order: Object}} props
 */
export function OrderCustomerCell({ order }) {
  return (
    <div>
      <span className="customer-name">
        {order.customer?.firstName} {order.customer?.lastName}
      </span>
      <small className="cell-subtitle">
        {order.customer?.email || "—"}
      </small>
    </div>
  );
}
