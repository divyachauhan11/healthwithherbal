import { money } from "./invoice-utils";

/**
 * Invoice totals: subtotal, coupon discount, shipping and grand total.
 * @param {object} props
 * @param {object} props.order Invoiced order.
 */
export function InvoiceTotals({ order }) {
  return (
    <dl className="invoice-totals">
      <div><dt>Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
      {(Number(order.discount) || 0) > 0 && <div><dt>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt><dd>−{money(order.discount)}</dd></div>}
      <div><dt>Shipping</dt><dd>{Number(order.shipping) === 0 ? "Free" : money(order.shipping)}</dd></div>
      <div className="invoice-grand-total"><dt>Total</dt><dd>{money(order.total)}</dd></div>
    </dl>
  );
}
