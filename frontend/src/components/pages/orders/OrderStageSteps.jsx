import { OrderStageStep } from "./OrderStageStep";
import { ORDER_STAGES } from "./order-utils";

/**
 * The four-stage delivery timeline (placed → packed → in transit → delivered).
 * @param {object} props
 * @param {string} props.status Lower-cased order status.
 */
export function OrderStageSteps({ status }) {
  return (
    <div className="order-steps-grid">
      {ORDER_STAGES.map((stage, idx) => (
        <OrderStageStep
          key={stage.key}
          stage={stage}
          index={idx}
          status={status}
          showDivider={idx < ORDER_STAGES.length - 1}
        />
      ))}
    </div>
  );
}
