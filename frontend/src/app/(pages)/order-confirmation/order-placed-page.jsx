"use client";
import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Package,
  Calendar,
  MapPin,
  CreditCard,
  Truck,
  Copy,
  Check,
  ShoppingBag,
  ArrowRight,
  Printer,
  FileText,
  Clock,
  Sparkles,
  XCircle,
  Star,
} from "lucide-react";
import { fetchOrderDetails, getOrderLiveStreamUrl } from "../../../lib/api";
import { ProductReviewModal } from "../../../components/global";

const STAGES = [
  {
    key: "placed",
    name: "Order Placed",
    timeText: (status) => (status === "placed" ? "Just now" : "Confirmed"),
    icon: CheckCircle2,
  },
  {
    key: "processing",
    name: "Packed & Blessed",
    timeText: (status) =>
      status === "placed"
        ? "Within 24 hours"
        : status === "processing"
        ? "Packing & quality check"
        : "Completed",
    icon: Package,
  },
  {
    key: "shipped",
    name: "In Transit",
    timeText: (status) =>
      status === "shipped"
        ? "On the way to you"
        : status === "delivered"
        ? "Arrived"
        : "2-4 business days",
    icon: Truck,
  },
  {
    key: "delivered",
    name: "Delivered",
    timeText: (status) =>
      status === "delivered" ? "Delivered to your doorstep" : "To your doorstep",
    icon: CheckCircle2,
  },
];

const getStageState = (stageIndex, status) => {
  if (status === "cancelled") {
    return { isCompleted: false, isCurrent: false, isPending: true };
  }
  if (status === "delivered") {
    return { isCompleted: true, isCurrent: false, isPending: false };
  }
  if (status === "shipped") {
    if (stageIndex < 2) return { isCompleted: true, isCurrent: false, isPending: false };
    if (stageIndex === 2) return { isCompleted: false, isCurrent: true, isPending: false };
    return { isCompleted: false, isCurrent: false, isPending: true };
  }
  if (status === "processing") {
    if (stageIndex === 0) return { isCompleted: true, isCurrent: false, isPending: false };
    if (stageIndex === 1) return { isCompleted: false, isCurrent: true, isPending: false };
    return { isCompleted: false, isCurrent: false, isPending: true };
  }
  // status === "placed" (Initial stage: Step 0 confirmed, Step 1 in-progress/packing)
  if (stageIndex === 0) return { isCompleted: true, isCurrent: false, isPending: false };
  if (stageIndex === 1) return { isCompleted: false, isCurrent: true, isPending: false };
  return { isCompleted: false, isCurrent: false, isPending: true };
};

const isDividerActive = (dividerIndex, status) => {
  if (status === "cancelled") return false;
  if (status === "delivered") return true;
  if (status === "shipped") return dividerIndex <= 1;
  return dividerIndex === 0;
};

export function OrderPlacedPage({
  order,
  navigate,
  currentUser,
}) {
  const [copied, setCopied] = useState(false);
  const [cachedOrder, setCachedOrder] = useState(null);
  const [liveOrderData, setLiveOrderData] = useState(null);
  const [reviewModalItem, setReviewModalItem] = useState(null);

  useEffect(() => {
    if (!order && typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hwh_last_order");
        if (saved) {
          setCachedOrder(JSON.parse(saved));
        }
      } catch (e) {}
    }
  }, [order]);

  // Active real order from checkout or cache
  const rawOrder = order || cachedOrder || null;

  const displayOrder = liveOrderData && rawOrder
    ? { ...rawOrder, ...liveOrderData }
    : rawOrder;

  const currentStatus = (displayOrder?.status || "placed").toLowerCase();

  // Real-time synchronization with admin status changes
  useEffect(() => {
    const targetOrderNumber = rawOrder?.orderNumber;
    const targetOrderId = rawOrder?._id;
    const identifier = targetOrderNumber || targetOrderId;
    if (!identifier) return;

    let isMounted = true;

    // 1. Initial live fetch from backend
    fetchOrderDetails(identifier)
      .then((fresh) => {
        if (isMounted && fresh) {
          setLiveOrderData((prev) => ({ ...(prev || {}), ...fresh }));
        }
      })
      .catch(() => {});

    // 2. Connect to real-time Server-Sent Events (SSE) stream
    let eventSource = null;
    try {
      const sseUrl = getOrderLiveStreamUrl(identifier);
      if (sseUrl && typeof EventSource !== "undefined") {
        eventSource = new EventSource(sseUrl);
        eventSource.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (isMounted && data?.status) {
              setLiveOrderData((prev) => ({
                ...(prev || {}),
                status: data.status,
                updatedAt: data.updatedAt || new Date().toISOString(),
              }));
            }
          } catch {}
        };
      }
    } catch {}

    // 3. Listen to instant cross-tab BroadcastChannel from admin
    let bc = null;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        bc = new BroadcastChannel("hwh_order_status");
        bc.onmessage = (e) => {
          const { id, status } = e.data || {};
          if (
            isMounted &&
            status &&
            (id === targetOrderId ||
              id === targetOrderNumber ||
              id === displayOrder?.orderNumber ||
              id === displayOrder?._id)
          ) {
            setLiveOrderData((prev) => ({
              ...(prev || {}),
              status,
              updatedAt: new Date().toISOString(),
            }));
          }
        };
      }
    } catch {}

    // 4. Listen to storage events for cross-window synchronization
    const handleStorage = (e) => {
      if (e.key === "hwh_order_status_update" && e.newValue) {
        try {
          const { id, status } = JSON.parse(e.newValue);
          if (
            isMounted &&
            status &&
            (id === targetOrderId ||
              id === targetOrderNumber ||
              id === displayOrder?.orderNumber ||
              id === displayOrder?._id)
          ) {
            setLiveOrderData((prev) => ({
              ...(prev || {}),
              status,
              updatedAt: new Date().toISOString(),
            }));
          }
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);

    // 5. Polling fallback every 3.5 seconds
    const intervalId = setInterval(async () => {
      try {
        const fresh = await fetchOrderDetails(identifier);
        if (isMounted && fresh?.status) {
          setLiveOrderData((prev) => ({ ...(prev || {}), ...fresh }));
        }
      } catch {}
    }, 3500);

    return () => {
      isMounted = false;
      eventSource?.close();
      bc?.close();
      window.removeEventListener("storage", handleStorage);
      clearInterval(intervalId);
    };
  }, [rawOrder?.orderNumber, rawOrder?._id]);

  if (!displayOrder) {
    return (
      <div className="order-placed-wrapper page-width" style={{ padding: "80px 20px", textAlign: "center" }}>
        <PackageCheck size={56} style={{ color: "var(--forest)", opacity: 0.7, margin: "0 auto 18px" }} />
        <h2 style={{ fontSize: "28px", color: "var(--forest-deep)", marginBottom: "10px" }}>No Active Order Found</h2>
        <p style={{ color: "var(--muted)", maxWidth: "460px", margin: "0 auto 28px", fontSize: "15px", lineHeight: "1.6" }}>
          We could not find a recently completed order in this session. If you have already placed an order, you can view its live status under your account.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            className="app-button"
            onClick={() => navigate("account")}
          >
            Go to My Account
          </button>
          <button
            type="button"
            className="app-button secondary"
            onClick={() => navigate("home")}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const copyOrderNumber = () => {
    if (displayOrder.orderNumber) {
      navigator.clipboard.writeText(displayOrder.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const orderDate = new Date(displayOrder.createdAt || Date.now()).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const address = displayOrder.shippingAddress || displayOrder.customer || {};

  return (
    <div className="order-placed-wrapper page-width">
      {/* =================================================================== */}
      {/* HERO BANNER: Celebration & Confirmation                             */}
      {/* =================================================================== */}
      <div className="order-placed-hero">
        <div className="order-placed-check-circle">
          <CheckCircle2 size={46} strokeWidth={2.2} />
        </div>
        <span className="order-placed-eyebrow">
          <Sparkles size={14} /> ORDER CONFIRMED
        </span>
        <h1 className="order-placed-title">
          Thank You for Choosing Pure Wellness
        </h1>
        <p className="order-placed-subtitle">
          Your order has been safely placed and is now being lovingly prepared by our Ayurvedic apothecarists.
        </p>

        {/* Order Identifier Tag Box */}
        <div className="order-id-badge-card">
          <div className="order-id-group">
            <span className="order-id-label">Order Reference:</span>
            <strong className="order-id-value">{displayOrder.orderNumber}</strong>
            <button
              type="button"
              className="copy-order-btn"
              onClick={copyOrderNumber}
              title="Copy Order Reference"
            >
              {copied ? (
                <>
                  <Check size={14} color="#15803d" /> Copied
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy
                </>
              )}
            </button>
          </div>
          <div className="order-date-pill">
            <Calendar size={13} />
            <span>{orderDate}</span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4-STAGE ESTIMATED DELIVERY TIMELINE (REAL-TIME REACTIVE)            */}
      {/* =================================================================== */}
      <div className="order-tracker-card">
        <div className="tracker-card-top-row">
          <h3 className="tracker-card-title">Order Status & Dispatch Timeline</h3>
          <div className={`tracker-live-indicator status-${currentStatus}`}>
            <span className="live-pulse-dot" />
            <span className="live-status-label">
              Status: <strong>{currentStatus.toUpperCase()}</strong>
            </span>
          </div>
        </div>

        {currentStatus === "cancelled" ? (
          <div className="order-cancelled-box">
            <XCircle size={22} color="#dc2626" />
            <div>
              <strong>This order has been cancelled by the store administrator.</strong>
              <p>If you have any questions or require assistance, please contact our herbal care team.</p>
            </div>
          </div>
        ) : (
          <div className="order-steps-grid">
            {STAGES.map((stage, idx) => {
              const state = getStageState(idx, currentStatus);
              const IconComponent = state.isCompleted ? CheckCircle2 : stage.icon;
              return (
                <div key={stage.key} style={{ display: "contents" }}>
                  <div
                    className={`order-step-item ${state.isCompleted ? "completed active" : state.isCurrent ? "in-progress active" : "pending"}`}
                  >
                    <div
                      className={`step-icon-circle ${state.isCompleted ? "completed" : state.isCurrent ? "current" : ""}`}
                    >
                      <IconComponent size={state.isCompleted ? 20 : 18} />
                    </div>
                    <div className="step-text">
                      <span className="step-name">{stage.name}</span>
                      <span className="step-time">
                        {stage.timeText(currentStatus)}
                      </span>
                    </div>
                  </div>

                  {idx < STAGES.length - 1 && (
                    <div
                      className={`order-step-divider ${isDividerActive(idx, currentStatus) ? "active" : ""}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* TWO-COLUMN DETAILS GRID                                             */}
      {/* =================================================================== */}
      <div className="order-placed-details-grid">
        {/* Left Column: Items & Receipt */}
        <div className="order-placed-main-col">
          <div className="order-receipt-card">
            <div className="receipt-card-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Package size={18} color="var(--forest)" />
                <h2>Items in this Order ({displayOrder.items?.length || 0})</h2>
              </div>
              <span className={`receipt-status-pill status-${currentStatus}`}>
                {currentStatus.toUpperCase()}
              </span>
            </div>

            {currentStatus === "delivered" && (
              <div className="delivered-review-callout">
                <div className="callout-icon-box">
                  <Sparkles size={18} color="#15803d" />
                </div>
                <div className="callout-text">
                  <strong>Your herbal remedies have arrived!</strong>
                  <p>
                    Share your authentic experience with the products below. Your feedback helps our community and herbalists maintain the highest standard of Ayurvedic purity.
                  </p>
                </div>
              </div>
            )}

            <div className="order-items-table">
              {(displayOrder.items || []).map((item, idx) => (
                <div key={idx} className="order-placed-item-row">
                  <div className="item-icon-box">
                    <Package size={22} />
                  </div>
                  <div className="item-text-info">
                    <strong className="item-title">{item.titleSnapshot || item.title}</strong>
                    <span className="item-brand">{item.brandSnapshot || item.brand || "Health with Herbal"}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px", flexWrap: "wrap" }}>
                      <span className="item-qty-tag">Quantity: {item.quantity}</span>
                      {currentStatus === "delivered" && (
                        <button
                          type="button"
                          className="item-review-btn"
                          onClick={() => setReviewModalItem(item)}
                          title={`Review ${item.titleSnapshot || item.title}`}
                        >
                          <Star size={13} fill="#f59e0b" color="#f59e0b" />
                          <span>Write Review</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="item-price-col">
                    <span className="unit-calc">
                      {item.quantity} × ₹{item.unitPrice}
                    </span>
                    <strong className="line-total-val">
                      ₹{item.lineTotal || item.unitPrice * item.quantity}
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Note attached to order */}
            {displayOrder.orderNote && (
              <div className="order-customer-note-box">
                <FileText size={16} />
                <div>
                  <strong>Special Delivery Note:</strong>
                  <p>{displayOrder.orderNote}</p>
                </div>
              </div>
            )}

            {/* Summary Lines */}
            <div className="order-totals-breakdown">
              <div className="totals-line">
                <span>Subtotal</span>
                <strong>₹{displayOrder.subtotal?.toFixed ? displayOrder.subtotal.toFixed(2) : displayOrder.subtotal}</strong>
              </div>
              <div className="totals-line">
                <span>Shipping Fee</span>
                <strong>
                  {displayOrder.shipping === 0 ? "FREE" : `₹${displayOrder.shipping}`}
                </strong>
              </div>
              {displayOrder.discount > 0 && (
                <div className="totals-line discount">
                  <span>
                    Discount Applied {displayOrder.couponCode ? `(${displayOrder.couponCode})` : ""}
                  </span>
                  <strong>-₹{displayOrder.discount}</strong>
                </div>
              )}
              <div className="totals-line grand-total">
                <span>Total Amount</span>
                <span className="grand-total-amount">
                  ₹{displayOrder.total?.toFixed ? displayOrder.total.toFixed(2) : displayOrder.total}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Delivery Details & Payment Info */}
        <div className="order-placed-side-col">
          {/* Shipping Address Card */}
          <div className="order-info-card">
            <div className="info-card-header">
              <MapPin size={17} color="var(--forest)" />
              <h3>Delivery Address</h3>
            </div>
            <div className="info-card-body">
              <div className="recipient-name">
                {address.firstName} {address.lastName}
              </div>
              <p className="address-lines">
                {address.street} <br />
                {address.city}, {address.postalCode} <br />
                {address.country || "India"}
              </p>
              {address.phone && (
                <div className="contact-row">
                  <span>Phone:</span> <strong>{address.phone}</strong>
                </div>
              )}
              {address.email && (
                <div className="contact-row">
                  <span>Email:</span> <strong>{address.email}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Payment Card */}
          <div className="order-info-card">
            <div className="info-card-header">
              <CreditCard size={17} color="var(--forest)" />
              <h3>Payment Method</h3>
            </div>
            <div className="info-card-body">
              <div className="payment-type-badge">
                <CheckCircle2 size={15} color="#15803d" />
                <span>
                  {displayOrder.paymentMethod === "cash_on_delivery"
                    ? "Cash on Delivery (Pay on Arrival)"
                    : "Prepaid Online"}
                </span>
              </div>
              <p className="payment-instructions">
                No prepayment required. Please keep ₹{displayOrder.total} in cash or UPI ready when our courier partner arrives at your address.
              </p>
            </div>
          </div>

          {/* Support / Herbal Guarantee */}
          <div className="order-guarantee-card">
            <Clock size={16} color="var(--forest)" />
            <div>
              <strong>Questions or changes?</strong>
              <p>
                Email us at <em>care@healthwithherbal.com</em> with your order reference <strong>{displayOrder.orderNumber}</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* BOTTOM ACTIONS                                                      */}
      {/* =================================================================== */}
      <div className="order-placed-actions-row">
        <button
          type="button"
          className="app-button continue-btn"
          onClick={() => navigate("shop")}
        >
          <ShoppingBag size={17} /> Continue Shopping
        </button>

        <button
          type="button"
          className="account-orders-cta-btn"
          onClick={() => navigate("account")}
        >
          View in My Orders <ArrowRight size={16} />
        </button>

        <button
          type="button"
          className="print-receipt-btn"
          onClick={() => window.print()}
        >
          <Printer size={16} /> Print Receipt
        </button>
      </div>

      {/* Product Review Modal for Delivered Orders */}
      <ProductReviewModal
        isOpen={Boolean(reviewModalItem)}
        onClose={() => setReviewModalItem(null)}
        product={reviewModalItem}
        order={displayOrder}
        currentUser={currentUser}
      />
    </div>
  );
}
