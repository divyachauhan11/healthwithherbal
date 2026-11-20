import { ReturnProgressStep } from "./ReturnProgressStep";
import { getReturnExchangeProgress, requestTypeLabel, statusLabel } from "./order-utils";

/**
 * Progress card of one return/exchange request: request type, item, status,
 * refund badge and the submitted → review → resolution track.
 * @param {object} props
 * @param {object} props.request Return/exchange request.
 */
export function ReturnExchangeProgressCard({ request }) {
  const { requestStatus, steps, refundLabel, refundClass } = getReturnExchangeProgress(request);
  const itemTitle = request.item?.title || "Requested item";

  return (
    <article className="return-exchange-progress-card">
      <div className="return-exchange-progress-heading">
        <div>
          <strong>{requestTypeLabel(request.type)} · {itemTitle}</strong>
          <span>Request status: {statusLabel(requestStatus)}</span>
        </div>
        <span className={`return-progress-refund refund-${refundClass}`}>
          Refund: {refundLabel}
        </span>
      </div>
      <div className="return-progress-track">
        {steps.map((step, index) => (
          <ReturnProgressStep
            key={step.label}
            step={step}
            index={index}
            showConnector={index < steps.length - 1}
          />
        ))}
      </div>
    </article>
  );
}
