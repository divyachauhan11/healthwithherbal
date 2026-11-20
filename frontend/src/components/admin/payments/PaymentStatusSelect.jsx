import { PAYMENT_STATUSES } from "@/constants/statuses";
import { PAYMENT_STATUS_OPTIONS } from "./payment-utils";

/**
 * Inline status select for a payment row.
 * @param {{payment: object, disabled: boolean, onStatusChange: (payment: object, status: string) => void}} props
 */
export function PaymentStatusSelect({ payment, disabled, onStatusChange }) {
  return <select className={`payment-status-select ${payment.status || PAYMENT_STATUSES[0]}`} value={payment.status || PAYMENT_STATUSES[0]} disabled={disabled} onChange={(event) => onStatusChange(payment, event.target.value)} aria-label={`Update payment status for order ${payment.orderNumber}`}>{PAYMENT_STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>;
}
