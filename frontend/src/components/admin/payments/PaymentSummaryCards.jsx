import { CreditCard } from "lucide-react";

/**
 * Summary cards with the number of recorded, paid, pending and refunded payments.
 * @param {{counts: {all: number, paid: number, pending: number, refunded: number}}} props
 */
export function PaymentSummaryCards({ counts }) {
  return (
    <section className="payment-summary-cards" aria-label="Payment summary">
      <article><span><CreditCard size={16} /> Payment records</span><strong>{counts.all}</strong><small>All recorded transactions</small></article>
      <article><span>Paid</span><strong>{counts.paid}</strong><small>Successfully collected</small></article>
      <article><span>Awaiting collection</span><strong>{counts.pending}</strong><small>Pending or cash on delivery</small></article>
      <article><span>Refunded</span><strong>{counts.refunded}</strong><small>Marked as refunded</small></article>
    </section>
  );
}
