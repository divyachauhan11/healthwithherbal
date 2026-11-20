import { Calendar, ChevronDown } from "lucide-react";
import { OrderCollapsedProduct } from "./OrderCollapsedProduct";
import { formatOrderCardDate } from "./account-utils";

/**
 * Header of an account order card: first product (collapsed) or order number
 * (expanded), order date, status pill and the expand/collapse toggle.
 * @param {object} props
 * @param {object} props.order Order shown by the card.
 * @param {boolean} props.isExpanded Card is expanded.
 * @param {() => void} props.onToggle Expands or collapses the card.
 * @param {string} props.defaultStatus Status class used when the order has none.
 */
export function OrderCardHeader({ order, isExpanded, onToggle, defaultStatus }) {
  return (
    <div className="order-card-header">
      <div className="order-meta-info">
        {!isExpanded ? (
          <OrderCollapsedProduct item={order.items?.[0]} />
        ) : (
          <span className="order-num-tag">{order.orderNumber}</span>
        )}
        <span className="order-date-tag">
          <Calendar size={13} />
          {formatOrderCardDate(order.createdAt)}
        </span>
      </div>
      <div className="order-card-header-actions">
        <span className={`order-status-pill status-${order.status || defaultStatus}`}>
          {order.status ? order.status.toUpperCase() : "CONFIRMED"}
        </span>
        <button
          type="button"
          className="order-card-toggle"
          aria-label={`${isExpanded ? "Close" : "Open"} order ${order.orderNumber}`}
          aria-expanded={Boolean(isExpanded)}
          onClick={onToggle}
        >
          <ChevronDown size={18} className={`order-card-toggle-icon ${isExpanded ? "is-expanded" : ""}`} />
        </button>
      </div>
    </div>
  );
}
