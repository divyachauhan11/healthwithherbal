import { currency, dateTimeLabel } from "@/components/admin/global/admin-utils";
import { PaymentDetailSectionTitle } from "./PaymentDetailSectionTitle";

/**
 * "Payment record" section of the payment details dialog: method, gateway reference and timeline.
 * @param {{payment: object, order: object}} props
 */
export function PaymentRecordSection({ payment, order }) {
  return (
    <section className="payment-detail-section payment-detail-record-section">
      <PaymentDetailSectionTitle index="03" title="Payment record" description="Method, gateway reference, and audit timeline" />
      <div className="payment-detail-facts payment-detail-payment-facts">
        <article><span>Payment ID</span><strong>{payment._id || "—"}</strong></article>
        <article><span>Payment method</span><strong className="capitalize">{String(payment.method || order.paymentMethod || "—").replaceAll("_", " ")}</strong></article>
        <article><span>Gateway</span><strong>{payment.gateway || "Cash on delivery"}</strong></article>
        <article><span>Transaction reference</span><strong>{payment.gatewayTxnId || "Not assigned"}</strong></article>
        <article><span>Recorded amount</span><strong>{currency(payment.amount, payment.currency || "INR")}</strong></article>
        <article><span>Currency</span><strong>{payment.currency || "INR"}</strong></article>
        <article><span>Created</span><strong>{dateTimeLabel(payment.createdAt)}</strong></article>
        <article><span>Last updated</span><strong>{dateTimeLabel(payment.updatedAt)}</strong></article>
        <article><span>Paid at</span><strong>{dateTimeLabel(payment.paidAt)}</strong></article>
      </div>
    </section>
  );
}
