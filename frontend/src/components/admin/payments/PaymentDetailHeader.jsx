import { X } from "lucide-react";
import { dateTimeLabel } from "@/components/admin/global/admin-utils";

/**
 * Header of the payment details dialog: order number, customer, record date and close button.
 * @param {{payment: object, customerName: string, onClose: () => void}} props
 */
export function PaymentDetailHeader({ payment, customerName, onClose }) {
  return (
    <header>
      <div><span>Payment details</span><h2 id="payment-detail-title">Order #{payment.orderNumber || "—"}</h2><p>{customerName} · Recorded {dateTimeLabel(payment.createdAt)}</p></div>
      <button type="button" onClick={onClose} aria-label="Close payment details"><X size={19} /></button>
    </header>
  );
}
