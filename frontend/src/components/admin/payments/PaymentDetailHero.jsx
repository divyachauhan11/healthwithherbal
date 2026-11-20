import { PAYMENT_STATUSES } from "@/constants/statuses";
import { STATUS_BADGE_MAPS } from "@/constants/status-badges";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { currency } from "@/components/admin/global/admin-utils";

/**
 * Payment amount and status chip shown at the top of the payment details dialog.
 * @param {{payment: object}} props
 */
export function PaymentDetailHero({ payment }) {
  return (
    <div className="payment-detail-hero">
      <div><span>Payment amount</span><strong>{currency(payment.amount, payment.currency || "INR")}</strong></div>
      <StatusBadge
        status={payment.status || PAYMENT_STATUSES[0]}
        statusMap={STATUS_BADGE_MAPS.payment}
        className="payment-status-chip"
      />
    </div>
  );
}
