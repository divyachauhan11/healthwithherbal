import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  FileText,
  Package,
  RotateCcw,
  Sparkles,
  Star,
} from "lucide-react";
const returnRequestMatchesItem = (request, item, itemIndex) => {
  if (Number.isInteger(request.itemIndex)) return request.itemIndex === itemIndex;
  return String(request.item?.title || "").trim().toLowerCase() === String(item.title || "").trim().toLowerCase();
};

export function OrderCard({
  order,
  isExpanded,
  onToggle,
  onViewOrder,
  onReviewProduct,
  onRequestReturnExchange,
  orderStatuses,
  returnExchangeStatuses,
  returnExchangeTypes,
}) {
  const firstItem = order.items?.[0];
  const firstItemImage = firstItem?.image || firstItem?.product?.image || firstItem?.product?.images?.[0];
  const isDelivered = (order.status || "").toLowerCase() === orderStatuses[3];

  return (
    <div className={`account-order-card full-order-card ${isExpanded ? "" : "is-collapsed"}`}>
      <div className="order-card-header">
        <div className="order-meta-info">
          {!isExpanded ? (
            <div className="order-collapsed-product">
              <div className="order-item-img-placeholder order-collapsed-product-image">
                <Package size={20} />
                {firstItemImage && (
                  <img
                    src={firstItemImage}
                    alt={firstItem?.title || "Ordered product"}
                    loading="lazy"
                    onError={(event) => { event.currentTarget.style.display = "none"; }}
                  />
                )}
              </div>
              <div className="order-collapsed-product-info">
                <strong>{firstItem?.title || firstItem?.product?.title || "Ordered product"}</strong>
                <span>{firstItem?.brand || firstItem?.product?.brand || "Health with Herbal"}</span>
                <small>Qty: {firstItem?.quantity || 1}</small>
              </div>
            </div>
          ) : (
            <span className="order-num-tag">{order.orderNumber}</span>
          )}
          <span className="order-date-tag">
            <Calendar size={13} />
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="order-card-header-actions">
          <span className={`order-status-pill status-${order.status || orderStatuses[0]}`}>
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

      {isDelivered && (
        <div className="delivered-review-callout" style={{ margin: "10px 0 14px" }}>
          <div className="callout-icon-box"><Sparkles size={16} color="#15803d" /></div>
          <div className="callout-text">
            <strong>Order Delivered!</strong>
            <p>Share your authentic experience with the herbal products below. Your feedback helps our community!</p>
          </div>
        </div>
      )}

      <div className="order-items-grid">
        {(order.items || []).map((item, idx) => (
          <div key={idx} className="order-item-detailed">
            <div className="order-item-img-placeholder">
              <Package size={20} />
              {(item.image || item.product?.image || item.product?.images?.[0]) && (
                <img
                  src={item.image || item.product?.image || item.product?.images?.[0]}
                  alt={item.title || "Ordered product"}
                  loading="lazy"
                  onError={(event) => { event.currentTarget.style.display = "none"; }}
                />
              )}
            </div>
            <div className="order-item-info">
              <div className="item-title">{item.title}</div>
              <div className="item-brand">{item.brand || "Health with Herbal"}</div>
              <div className="item-qty">Qty: {item.quantity}</div>
              {(order.returnExchangeRequests || [])
                .filter((request) => returnRequestMatchesItem(request, item, idx))
                .map((request) => (
                  <div key={request._id} className={`customer-return-status customer-return-status-${request.status || returnExchangeStatuses[0]}`}>
                    <RotateCcw size={13} />
                    <span>{request.type === returnExchangeTypes[1] ? "Exchange" : "Return"} request</span>
                    <strong>{(request.status || returnExchangeStatuses[0]).charAt(0).toUpperCase() + (request.status || returnExchangeStatuses[0]).slice(1)}</strong>
                  </div>
                ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
              <div className="order-item-price">₹{item.lineTotal || item.unitPrice * item.quantity}</div>
              {isDelivered && (
                <>
                  <button type="button" className="item-review-btn" onClick={() => onReviewProduct?.(item, order)} title={`Review ${item.title}`}>
                    <Star size={12} fill="#f59e0b" color="#f59e0b" />
                    <span>Review Product</span>
                  </button>
                  {(order.returnExchangeRequests || []).some((request) => returnRequestMatchesItem(request, item, idx)) ? (
                    <span className="item-review-btn return-exchange-request-btn is-submitted" aria-label="Return or exchange request already submitted">
                      <CheckCircle2 size={13} />
                      <span>Request submitted</span>
                    </span>
                  ) : (
                    <button type="button" className="item-review-btn return-exchange-request-btn" onClick={() => onRequestReturnExchange?.(item, order, idx)}>
                      <RotateCcw size={13} />
                      <span>Request Return / Exchange</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="order-summary-breakdown">
        <div className="summary-row"><span>Subtotal:</span><span>₹{order.subtotal}</span></div>
        <div className="summary-row"><span>Shipping:</span><span>{order.shipping === 0 ? "FREE" : `₹${order.shipping}`}</span></div>
        {order.discount > 0 && (
          <div className="summary-row discount">
            <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}:</span>
            <span>-₹{order.discount}</span>
          </div>
        )}
        <div className="summary-row grand-total"><span>Total Paid:</span><span className="total-highlight">₹{order.total}</span></div>
      </div>

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
    </div>
  );
}
