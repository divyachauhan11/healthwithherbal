import { ORDER_STATUSES } from "@/constants/statuses";
import { OrderCancelledNotice } from "./OrderCancelledNotice";
import { OrderStageSteps } from "./OrderStageSteps";
import { ReturnExchangeProgressSection } from "./ReturnExchangeProgressSection";

/**
 * "Order Status & Dispatch Timeline" card: live status indicator, the delivery
 * timeline (or a cancellation notice) and the progress of any return/exchange
 * requests.
 * @param {object} props
 * @param {string} props.status Lower-cased live order status.
 * @param {object[]} [props.returnExchangeRequests] The order's return/exchange requests.
 */
export function OrderStatusTimeline({ status, returnExchangeRequests }) {
  return (
    <div className="order-tracker-card">
      <div className="tracker-card-top-row">
        <h3 className="tracker-card-title">
          Order Status & Dispatch Timeline
        </h3>
        <div className={`tracker-live-indicator status-${status}`}>
          <span className="live-pulse-dot" />
          <span className="live-status-label">
            Status: <strong>{status.toUpperCase()}</strong>
          </span>
        </div>
      </div>

      {status === ORDER_STATUSES[4] ? (
        <OrderCancelledNotice />
      ) : (
        <OrderStageSteps status={status} />
      )}
      {(returnExchangeRequests || []).length > 0 && (
        <ReturnExchangeProgressSection requests={returnExchangeRequests} />
      )}
    </div>
  );
}
