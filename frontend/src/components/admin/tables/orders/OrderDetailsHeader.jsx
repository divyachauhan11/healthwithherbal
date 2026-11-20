import { X } from "lucide-react";
import { dateTimeLabel } from "../../global/admin-utils";

/**
 * Order details title: order number, placed date and the close button.
 * @param {{order: Object, onClose: () => void}} props
 */
export function OrderDetailsHeader({ order, onClose }) {
  return (
    <header className="order-detail-header">
      <div>
        <span className="order-detail-eyebrow">Order details</span>
        <h2 id="order-detail-title">#{order.orderNumber || "Order"}</h2>
        <p>Placed {dateTimeLabel(order.createdAt)}</p>
      </div>
      <button type="button" className="order-detail-close" onClick={onClose} aria-label="Close order details"><X size={20} /></button>
    </header>
  );
}
