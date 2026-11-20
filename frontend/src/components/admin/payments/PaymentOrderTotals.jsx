import { currency } from "@/components/admin/global/admin-utils";
import { getOrderShipping } from "./payment-utils";

/**
 * Subtotal, coupon, discount, shipping and total of the order a payment belongs to.
 * @param {{payment: object, order: object}} props
 */
export function PaymentOrderTotals({ payment, order }) {
  const currencyCode = order.currency || payment.currency || "INR";

  return (
    <div className="payment-detail-totals">
      <div><span>Subtotal</span><strong>{currency(order.subtotal, currencyCode)}</strong></div>
      {order.couponCode && <div><span>Coupon applied</span><strong>{order.couponCode}</strong></div>}
      {Number(order.discount) > 0 && <div><span>Discount</span><strong>−{currency(order.discount, currencyCode)}</strong></div>}
      <div><span>Shipping</span><strong>{Number(getOrderShipping(order)) === 0 ? "Free" : currency(getOrderShipping(order), currencyCode)}</strong></div>
      <div className="grand"><span>Order total</span><strong>{currency(order.total ?? payment.orderTotal, currencyCode)}</strong></div>
    </div>
  );
}
