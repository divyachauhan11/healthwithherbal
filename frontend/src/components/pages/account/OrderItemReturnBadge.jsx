import { RotateCcw } from "lucide-react";
import { capitalize } from "./account-utils";

/**
 * Return/exchange request status shown under an order line.
 * @param {object} props
 * @param {object} props.request Return/exchange request for the line.
 * @param {string} props.defaultStatus Status used when the request has none.
 * @param {string} props.exchangeType Request type value meaning "exchange".
 */
export function OrderItemReturnBadge({ request, defaultStatus, exchangeType }) {
  return (
    <div className={`customer-return-status customer-return-status-${request.status || defaultStatus}`}>
      <RotateCcw size={13} />
      <span>{request.type === exchangeType ? "Exchange" : "Return"} request</span>
      <strong>{capitalize(request.status || defaultStatus)}</strong>
    </div>
  );
}
