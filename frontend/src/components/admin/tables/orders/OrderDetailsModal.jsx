import { createPortal } from "react-dom";
import { OrderDetailsCards } from "./OrderDetailsCards";
import { OrderDetailsHeader } from "./OrderDetailsHeader";
import { OrderDetailsItems } from "./OrderDetailsItems";
import { OrderDetailsSummary } from "./OrderDetailsSummary";
import { OrderDetailsTotals } from "./OrderDetailsTotals";
import { useCloseOnEscape } from "./useCloseOnEscape";

/**
 * Full order details dialog (portalled into the body). Closes on Escape, the
 * close button or a click on the backdrop. Renders nothing without an order.
 * @param {{order: Object|null, onClose: () => void}} props
 */
export function OrderDetailsModal({ order, onClose }) {
  useCloseOnEscape(order, onClose);

  if (!order || typeof document === "undefined") return null;

  return createPortal(
    <div className="order-detail-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <section className="order-detail-modal" role="dialog" aria-modal="true" aria-labelledby="order-detail-title">
        <OrderDetailsHeader order={order} onClose={onClose} />

        <div className="order-detail-content">
          <OrderDetailsSummary order={order} />
          <OrderDetailsCards order={order} />
          <OrderDetailsItems order={order} />
          <OrderDetailsTotals order={order} />
        </div>
      </section>
    </div>,
    document.body,
  );
}
