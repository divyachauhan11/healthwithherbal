import { CreditCard } from "lucide-react";
import { PAYMENT_STATUSES } from "@/constants/statuses";
import { formatCustomerDateTime, formatCustomerMoney } from "./customer-utils";

/**
 * Payment records of a customer order, or an "unrecorded" row when there are none.
 * @param {{order: object}} props
 */
export function CustomerPaymentList({ order }) {
  return (
    <div className="customer-payment-list">
      {(order.payments || []).length ? order.payments.map((payment) => (
        <div className="customer-payment-row" key={payment._id}>
          <CreditCard size={15} />
          <div><strong>{String(payment.method || order.paymentMethod || "Payment").replaceAll("_", " ")}</strong><small>{payment.gateway ? `${payment.gateway} · ` : ""}{payment.gatewayTxnId ? `Txn ${payment.gatewayTxnId} · ` : ""}{payment.paidAt ? `Paid ${formatCustomerDateTime(payment.paidAt)}` : `Updated ${formatCustomerDateTime(payment.updatedAt || payment.createdAt)}`}</small></div>
          <span className={`customer-payment-status ${payment.status || PAYMENT_STATUSES[0]}`}>{payment.status || PAYMENT_STATUSES[0]}</span>
          <b>{formatCustomerMoney(payment.amount, payment.currency || order.currency)}</b>
        </div>
      )) : (
        <div className="customer-payment-row"><CreditCard size={15} /><div><strong>{String(order.paymentMethod || "Payment method unavailable").replaceAll("_", " ")}</strong><small>No payment record available</small></div><span className="customer-payment-status pending">Unrecorded</span><b>{formatCustomerMoney(order.total, order.currency)}</b></div>
      )}
    </div>
  );
}
