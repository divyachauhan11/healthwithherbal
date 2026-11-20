import { formatCustomerDateTime, formatCustomerMoney } from "./customer-utils";

/**
 * Order count, lifetime spend and most recent order date of a customer.
 * @param {{orders: Array<object>, totalSpent: number}} props `orders` are newest first.
 */
export function CustomerDetailStats({ orders, totalSpent }) {
  return (
    <section className="customer-detail-stats">
      <article><span>Total orders</span><strong>{orders.length}</strong></article>
      <article><span>Lifetime spend</span><strong>{formatCustomerMoney(totalSpent)}</strong></article>
      <article><span>Most recent order</span><strong>{orders.length ? formatCustomerDateTime(orders[0].createdAt) : "No orders"}</strong></article>
    </section>
  );
}
