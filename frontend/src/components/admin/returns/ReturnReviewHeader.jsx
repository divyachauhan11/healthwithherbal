import { X } from "lucide-react";
import { formatRequestReference } from "./returns-utils";

/**
 * Header of the return review dialog: request type, references and close button.
 * @param {{request: object, saving: boolean, onClose: () => void}} props
 */
export function ReturnReviewHeader({ request, saving, onClose }) {
  return (
    <header className="return-review-header">
      <div>
        <span className="return-review-eyebrow">Return & exchange</span>
        <h2 id="return-review-title">Review {request.type || "customer"} request</h2>
        <p>Request #{formatRequestReference(request._id)} <i /> Order #{request.orderNumber}</p>
      </div>
      <button type="button" onClick={onClose} disabled={saving} aria-label="Close review"><X size={18} /></button>
    </header>
  );
}
