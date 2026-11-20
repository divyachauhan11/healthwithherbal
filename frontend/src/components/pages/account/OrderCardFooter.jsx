import { CreditCard, FileText } from "lucide-react";

/**
 * Bottom row of an account order card: delivery address, order note, payment
 * method and the "View Details" link.
 * @param {object} props
 * @param {object} props.order Order shown by the card.
 * @param {(order: object) => void} [props.onViewOrder] Opens the order details page.
 */
export function OrderCardFooter({ order, onViewOrder }) {
  return (
    <div className="order-details-bottom-row">
      {order.shippingAddress && (
        <div className="order-delivery-snapshot">
          <strong>Delivery Address:</strong>
          <p>
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
            {order.shippingAddress.street}, {order.shippingAddress.city} - {order.shippingAddress.postalCode}
          </p>
        </div>
      )}
      {order.orderNote && (
        <div className="order-delivery-note"><FileText size={15} /><span><strong>Note:</strong> {order.orderNote}</span></div>
      )}
      <div className="order-payment-badge">
        <CreditCard size={15} />
        <span>{order.paymentMethod === "cash_on_delivery" ? "Cash on Delivery" : "Online Payment"}</span>
      </div>
      <button type="button" className="order-view-receipt-action" onClick={() => onViewOrder?.(order)}>
        <FileText size={13} /> View Details
      </button>
    </div>
  );
}
