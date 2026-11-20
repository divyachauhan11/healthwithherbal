import { describePaymentRecord, formatOrderMoney } from "./returns-utils";

/**
 * Payment records stored for the linked order.
 * @param {{request: object, order: object}} props `request.payments` holds the records.
 */
export function ReturnReviewPaymentRecords({ request, order }) {
  return (
    <div className="return-review-payment-records">
      <h4>Payment records</h4>
      {(request.payments || []).length ? request.payments.map((payment) => <article key={payment._id}>
        <span>{String(payment.method || payment.gateway || "Payment").replaceAll("_", " ")}</span>
        <strong>{formatOrderMoney(payment.amount, order)} · {payment.status || "Status unavailable"}</strong>
        <small>{describePaymentRecord(payment, order)}</small>
      </article>) : <p>No separate payment records found for this order.</p>}
    </div>
  );
}
