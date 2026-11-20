import { formatOrderAmount } from "./order-utils";

/**
 * Subtotal, shipping, discount (when any) and grand total of an order.
 * @param {{order: Object}} props
 */
export function OrderDetailsTotals({ order }) {
  const formatAmount = (amount) => formatOrderAmount(order, amount);

  return (
    <section className="order-detail-totals">
      <div><span>Subtotal</span><strong>{formatAmount(order.subtotal)}</strong></div>
      <div><span>Shipping</span><strong>{formatAmount(order.shipping ?? order.shippingFee)}</strong></div>
      {Number(order.discount) > 0 && <div><span>Discount</span><strong>−{formatAmount(order.discount)}</strong></div>}
      <div className="order-detail-grand-total"><span>Total</span><strong>{formatAmount(order.total)}</strong></div>
    </section>
  );
}
