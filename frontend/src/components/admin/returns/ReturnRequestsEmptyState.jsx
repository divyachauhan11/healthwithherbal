import { RotateCcw } from "lucide-react";

/**
 * Empty state of the returns table.
 * @param {{hasRequests: boolean}} props Whether any requests exist before filtering.
 */
export function ReturnRequestsEmptyState({ hasRequests }) {
  return (
    <div className="returns-empty">
      <div><RotateCcw size={22} /></div>
      <strong>
        {hasRequests
          ? "No requests match this view"
          : "No return or exchange requests yet"}
      </strong>
      <p>
        {hasRequests
          ? "Try another status or search term."
          : "Customer requests will appear here when submitted."}
      </p>
    </div>
  );
}
