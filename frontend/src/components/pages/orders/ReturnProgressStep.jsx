import { Check } from "lucide-react";

/**
 * One step of a return/exchange progress track, followed by its connector.
 * @param {object} props
 * @param {{label: string, state: string, detail: string}} props.step Step to show.
 * @param {number} props.index Step position (shown as its number until complete).
 * @param {boolean} props.showConnector Render the connector to the next step.
 */
export function ReturnProgressStep({ step, index, showConnector }) {
  return (
    <div className="return-progress-part">
      <div className={`return-progress-step step-${step.state}`}>
        <span className="return-progress-node">{step.state === "complete" ? <Check size={13} /> : index + 1}</span>
        <span className="return-progress-copy"><strong>{step.label}</strong><small>{step.detail}</small></span>
      </div>
      {showConnector && <span className={`return-progress-connector${step.state === "complete" ? " is-complete" : ""}`} />}
    </div>
  );
}
