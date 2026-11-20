import { formatCustomerMoney } from "./customer-utils";

/**
 * Subtotal, discount, shipping and total of a customer order.
 * @param {{order: object}} props
 */
export function CustomerOrderTotals({ order }) {
  return (
    <div className="customer-order-totals">
      <span>Subtotal <b>{formatCustomerMoney(order.subtotal, order.currency)}</b></span>
      {(Number(order.discount) || 0) > 0 && <span>Discount {order.couponCode ? `(${order.couponCode})` : ""} <b>−{formatCustomerMoney(order.discount, order.currency)}</b></span>}
      <span>Shipping <b>{Number(order.shipping) === 0 ? "Free" : formatCustomerMoney(order.shipping, order.currency)}</b></span>
      <span className="customer-order-total">Order total <b>{formatCustomerMoney(order.total, order.currency)}</b></span>
    </div>
  );
}
