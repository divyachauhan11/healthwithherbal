import { getOrderShipping } from "@/components/admin/payments/payment-utils";
import { formatOrderMoney } from "./returns-utils";

/**
 * Subtotal, discount, shipping and total of the linked order.
 * @param {{order: object}} props
 */
export function ReturnReviewOrderTotals({ order }) {
  return (
    <div className="return-review-order-totals">
      <div><span>Subtotal</span><strong>{formatOrderMoney(order.subtotal, order)}</strong></div>
      {Number(order.discount) > 0 && <div><span>Discount{order.couponCode ? ` · ${order.couponCode}` : ""}</span><strong>−{formatOrderMoney(order.discount, order)}</strong></div>}
      <div><span>Shipping</span><strong>{Number(getOrderShipping(order)) === 0 ? "Free" : formatOrderMoney(getOrderShipping(order), order)}</strong></div>
      <div className="return-review-order-total"><span>Order total</span><strong>{formatOrderMoney(order.total, order)}</strong></div>
    </div>
  );
}
