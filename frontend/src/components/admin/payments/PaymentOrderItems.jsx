import { PaymentOrderItem } from "./PaymentOrderItem";

/**
 * Item list of the order a payment belongs to.
 * @param {{order: object}} props
 */
export function PaymentOrderItems({ order }) {
  return (
    <div className="payment-detail-items">
      <div className="payment-detail-subheading"><h4>Items</h4><span>{(order.items || []).length}</span></div>
      {(order.items || []).length ? order.items.map((item, index) => <PaymentOrderItem key={`${item.product || item.legacyId || index}`} item={item} index={index} order={order} />) : <p className="payment-detail-empty">Order item details are unavailable.</p>}
    </div>
  );
}
