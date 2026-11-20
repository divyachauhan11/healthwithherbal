import { CheckCircle2 } from "lucide-react";
import { getStageState, isDividerActive } from "./order-utils";

/**
 * One stage of the delivery timeline (icon, name, caption) followed by its
 * connector. Uses `display: contents` so the step and connector sit directly
 * in the timeline grid.
 * @param {object} props
 * @param {{name: string, icon: Function, timeText: (status: string) => string}} props.stage Stage definition.
 * @param {number} props.index Stage position.
 * @param {string} props.status Lower-cased order status.
 * @param {boolean} props.showDivider Render the connector to the next stage.
 */
export function OrderStageStep({ stage, index, status, showDivider }) {
  const state = getStageState(index, status);
  const IconComponent = state.isCompleted
    ? CheckCircle2
    : stage.icon;

  return (
    <div style={{ display: "contents" }}>
      <div
        className={`order-step-item ${state.isCompleted ? "completed active" : state.isCurrent ? "in-progress active" : "pending"}`}
      >
        <div
          className={`step-icon-circle ${state.isCompleted ? "completed" : state.isCurrent ? "current" : ""}`}
        >
          <IconComponent size={state.isCompleted ? 20 : 18} />
        </div>
        <div className="step-text">
          <span className="step-name">{stage.name}</span>
          <span className="step-time">
            {stage.timeText(status)}
          </span>
        </div>
      </div>

      {showDivider && (
        <div
          className={`order-step-divider ${isDividerActive(index, status) ? "active" : ""}`}
        />
      )}
    </div>
  );
}
