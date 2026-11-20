import { Sparkles } from "lucide-react";

/** "Order Delivered!" callout on account order cards, inviting product reviews. */
export function OrderDeliveredNotice() {
  return (
    <div className="delivered-review-callout" style={{ margin: "10px 0 14px" }}>
      <div className="callout-icon-box"><Sparkles size={16} color="#15803d" /></div>
      <div className="callout-text">
        <strong>Order Delivered!</strong>
        <p>Share your authentic experience with the herbal products below. Your feedback helps our community!</p>
      </div>
    </div>
  );
}
