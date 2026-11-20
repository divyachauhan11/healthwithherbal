import { Sparkles } from "lucide-react";

/** Callout inviting product reviews once the order has been delivered. */
export function DeliveredReviewCallout() {
  return (
    <div className="delivered-review-callout">
      <div className="callout-icon-box">
        <Sparkles size={18} color="#15803d" />
      </div>
      <div className="callout-text">
        <strong>Your herbal remedies have arrived!</strong>
        <p>
          Share your authentic experience with the products below.
          Your feedback helps our community and herbalists maintain
          the highest standard of Ayurvedic purity.
        </p>
      </div>
    </div>
  );
}
