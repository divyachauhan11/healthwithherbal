import { RotateCcw } from "lucide-react";
import { ReturnExchangeProgressCard } from "./ReturnExchangeProgressCard";

/**
 * "Return & exchange progress" block of the status card: one progress card per request.
 * @param {object} props
 * @param {object[]} props.requests The order's return/exchange requests.
 */
export function ReturnExchangeProgressSection({ requests }) {
  return (
    <section className="return-exchange-progress-section" aria-label="Return and exchange status timeline">
      <div className="return-exchange-progress-section-heading">
        <RotateCcw size={16} />
        <h4>Return &amp; exchange progress</h4>
      </div>
      <div className="return-exchange-progress-list">
        {requests.map((request) => (
          <ReturnExchangeProgressCard key={request._id} request={request} />
        ))}
      </div>
    </section>
  );
}
