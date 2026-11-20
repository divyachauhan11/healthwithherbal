import { ORDER_STATUSES } from "@/constants/statuses";
import { CustomerOrderTotals } from "./CustomerOrderTotals";
import { CustomerPaymentList } from "./CustomerPaymentList";
import { formatCustomerDateTime, formatCustomerMoney, getCustomerOrderItemTotal } from "./customer-utils";

/**
 * One customer order: number, date, status, items, totals and payment records.
 * @param {{order: object}} props
 */
export function CustomerOrderCard({ order }) {
  return (
    <article className="customer-order-card">
      <div className="customer-order-heading">
        <div><strong>{order.orderNumber || `Order ${String(order._id).slice(-7)}`}</strong><small>{formatCustomerDateTime(order.createdAt)}</small></div>
        <span className={`customer-order-status ${order.status || ORDER_STATUSES[0]}`}>{order.status || ORDER_STATUSES[0]}</span>
      </div>
      <div className="customer-order-items">
        {(order.items || []).map((item, index) => (
          <div key={`${item.legacyId || item.product || item.title}-${index}`}>
            <span>{item.title || "Product"} <small>×{item.quantity || 1}</small></span>
            <strong>{formatCustomerMoney(getCustomerOrderItemTotal(item), order.currency)}</strong>
          </div>
        ))}
      </div>
      <CustomerOrderTotals order={order} />
      <CustomerPaymentList order={order} />
    </article>
  );
}
