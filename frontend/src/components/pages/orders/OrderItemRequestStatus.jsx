import { RotateCcw } from "lucide-react";
import { RETURN_EXCHANGE_STATUSES, REFUND_STATUSES } from "@/constants/statuses";
import { refundStatusLabel, requestTypeLabel, statusLabel } from "./order-utils";

/**
 * Request and refund status chips of a return/exchange request, shown under its order line.
 * @param {object} props
 * @param {object} props.request Return/exchange request for the line.
 */
export function OrderItemRequestStatus({ request }) {
  return (
    <div className="order-item-return-status">
      <div className={`order-item-return-request order-request-${request.status || RETURN_EXCHANGE_STATUSES[0]}`}>
        <RotateCcw size={14} />
        <span>{requestTypeLabel(request.type)} request</span>
        <strong>{statusLabel(request.status || RETURN_EXCHANGE_STATUSES[0])}</strong>
      </div>
      <div className={`order-item-refund-status order-refund-${request.refundStatus || REFUND_STATUSES[1]}`}>
        <span>Refund</span>
        <strong>{refundStatusLabel(request.refundStatus)}</strong>
      </div>
    </div>
  );
}
