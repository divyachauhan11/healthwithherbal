"use client";
import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Package,
  PackageCheck,
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
  Loader2,
  RotateCcw,
} from "lucide-react";
import {
  fetchOrderDetails,
  getOrderLiveStreamUrl,
} from "@/lib/api";
import { ProductReviewModal } from "@/components/pages/modals";
import {
  ORDER_STATUSES,
  REFUND_STATUSES,
  RETURN_EXCHANGE_STATUSES,
  RETURN_EXCHANGE_TYPES,
} from "@/constants/statuses";

const STAGES = [
  {
    key: ORDER_STATUSES[0],
    name: "Order Placed",
    timeText: (status) => (status === ORDER_STATUSES[0] ? "Just now" : "Confirmed"),
    icon: CheckCircle2,
  },
  {
    key: ORDER_STATUSES[1],
    name: "Packed & Blessed",
    timeText: (status) =>
      status === ORDER_STATUSES[0]
        ? "Within 24 hours"
        : status === ORDER_STATUSES[1]
          ? "Packing & quality check"
          : "Completed",
    icon: Package,
  },
  {
    key: ORDER_STATUSES[2],
    name: "In Transit",
    timeText: (status) =>
      status === ORDER_STATUSES[2]
        ? "On the way to you"
        : status === ORDER_STATUSES[3]
          ? "Arrived"
          : "2-4 business days",
    icon: Truck,
  },
  {
    key: ORDER_STATUSES[3],
    name: "Delivered",
    timeText: (status) =>
      status === ORDER_STATUSES[3]
        ? "Delivered to your doorstep"
        : "To your doorstep",
    icon: CheckCircle2,
  },
];

const getStageState = (stageIndex, status) => {
  if (status === ORDER_STATUSES[4]) {
    return { isCompleted: false, isCurrent: false, isPending: true };
  }
  if (status === ORDER_STATUSES[3]) {
    return { isCompleted: true, isCurrent: false, isPending: false };
  }
  if (status === ORDER_STATUSES[2]) {
    if (stageIndex < 2)
      return { isCompleted: true, isCurrent: false, isPending: false };
    if (stageIndex === 2)
      return { isCompleted: false, isCurrent: true, isPending: false };
    return { isCompleted: false, isCurrent: false, isPending: true };
  }
  if (status === ORDER_STATUSES[1]) {
    if (stageIndex === 0)
      return { isCompleted: true, isCurrent: false, isPending: false };
    if (stageIndex === 1)
      return { isCompleted: false, isCurrent: true, isPending: false };
    return { isCompleted: false, isCurrent: false, isPending: true };
  }
  // Initial placed stage: Step 0 confirmed, Step 1 in-progress/packing.
  if (stageIndex === 0)
    return { isCompleted: true, isCurrent: false, isPending: false };
  if (stageIndex === 1)
    return { isCompleted: false, isCurrent: true, isPending: false };
  return { isCompleted: false, isCurrent: false, isPending: true };
};

const isDividerActive = (dividerIndex, status) => {
  if (status === ORDER_STATUSES[4]) return false;
  if (status === ORDER_STATUSES[3]) return true;
  if (status === ORDER_STATUSES[2]) return dividerIndex <= 1;
  return dividerIndex === 0;
};

const orderProductImage = (item) =>
  item?.image ||
  item?.productImage ||
  item?.product?.image ||
  item?.product?.images?.[0] ||
  "";

const isRequestForOrderItem = (request, item, itemIndex) => {
  if (Number.isInteger(request.itemIndex)) return request.itemIndex === itemIndex;
  const requestedTitle = String(request.item?.title || "").trim().toLowerCase();
  const orderItemTitle = String(item.titleSnapshot || item.title || "").trim().toLowerCase();
  return requestedTitle && requestedTitle === orderItemTitle;
};

const statusLabel = (value) => value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : "Pending";

function ReturnExchangeProgress({ request }) {
  const requestStatus = request.status || RETURN_EXCHANGE_STATUSES[0];
  const rejected = requestStatus === RETURN_EXCHANGE_STATUSES[2];
  const steps = [
    { label: "Request submitted", state: "complete", detail: "Received" },
    {
      label: "Admin review",
      state: requestStatus === RETURN_EXCHANGE_STATUSES[0] ? "current" : rejected ? "rejected" : "complete",
      detail: rejected ? "Rejected" : requestStatus === RETURN_EXCHANGE_STATUSES[0] ? "Under review" : "Reviewed",
    },
    {
      label: request.type === RETURN_EXCHANGE_TYPES[1] ? "Exchange resolution" : "Return resolution",
      state: requestStatus === RETURN_EXCHANGE_STATUSES[1] ? "current" : requestStatus === RETURN_EXCHANGE_STATUSES[3] ? "complete" : "pending",
      detail: requestStatus === RETURN_EXCHANGE_STATUSES[1] ? "In progress" : requestStatus === RETURN_EXCHANGE_STATUSES[3] ? "Completed" : rejected ? "Not continued" : "Waiting",
    },
  ];
  const refundLabel = request.type === RETURN_EXCHANGE_TYPES[1]
    ? "Not applicable"
    : request.refundStatus === REFUND_STATUSES[2]
      ? "Completed"
      : request.refundStatus === REFUND_STATUSES[0] ? "Not required" : "Pending";
  const refundClass = request.type === RETURN_EXCHANGE_TYPES[1] || request.refundStatus === REFUND_STATUSES[0]
    ? "not-required"
    : request.refundStatus === REFUND_STATUSES[2] ? "complete" : "pending";
  const itemTitle = request.item?.title || "Requested item";

  return (
    <article className="return-exchange-progress-card">
      <div className="return-exchange-progress-heading">
        <div>
          <strong>{request.type === RETURN_EXCHANGE_TYPES[1] ? "Exchange" : "Return"} · {itemTitle}</strong>
          <span>Request status: {statusLabel(requestStatus)}</span>
        </div>
        <span className={`return-progress-refund refund-${refundClass}`}>
          Refund: {refundLabel}
        </span>
      </div>
      <div className="return-progress-track">
        {steps.map((step, index) => (
          <div className="return-progress-part" key={step.label}>
            <div className={`return-progress-step step-${step.state}`}>
              <span className="return-progress-node">{step.state === "complete" ? <Check size={13} /> : index + 1}</span>
              <span className="return-progress-copy"><strong>{step.label}</strong><small>{step.detail}</small></span>
            </div>
            {index < steps.length - 1 && <span className={`return-progress-connector${step.state === "complete" ? " is-complete" : ""}`} />}
          </div>
        ))}
      </div>
    </article>
  );
}

export function OrderPlacedPage({
  order,
  navigate,
  openContent,
  currentUser,
  detailMode = false,
}) {
  const [copied, setCopied] = useState(false);
  const [cachedOrder, setCachedOrder] = useState(null);
  const [liveOrderData, setLiveOrderData] = useState(null);
  const [reviewModalItem, setReviewModalItem] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [paymentResult, setPaymentResult] = useState("");

  useEffect(() => {
    if (detailMode || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const identifier = params.get("order");
    const result = params.get("payment");
    if (!identifier || !["success", "failed", "pending"].includes(result)) return;
    setPaymentResult("pending");
    let active = true;
    fetchOrderDetails(identifier)
      .then((fresh) => {
        if (!active || !fresh) return;
        setCachedOrder(fresh);
        setPaymentResult(
          fresh.paymentStatus === "paid"
            ? "success"
            : fresh.paymentStatus === "failed"
              ? "failed"
              : "pending",
        );
        if (fresh.paymentStatus === "paid") {
          window.setTimeout(() => window.dispatchEvent(new Event("hwh-payment-order-complete")), 0);
          try {
            localStorage.removeItem("hwh_cart");
          } catch {}
        }
        try {
          localStorage.setItem("hwh_last_order", JSON.stringify(fresh));
        } catch {}
      })
      .catch((error) => {
        if (active) console.error("Could not load the PayU order result:", error);
      });
    return () => {
      active = false;
    };
  }, [detailMode]);

  useEffect(() => {
    if (!detailMode || order || typeof window === "undefined") return;
    const identifier = decodeURIComponent(
      window.location.pathname.split("/").filter(Boolean).at(-1) || "",
    );
    if (!identifier) return;
    let active = true;
    setLoadingDetail(true);
    fetchOrderDetails(identifier)
      .then((fresh) => {
        if (active) setCachedOrder(fresh);
      })
      .catch((error) => {
        if (active) console.error("Could not load order details:", error);
      })
      .finally(() => {
        if (active) setLoadingDetail(false);
      });
    return () => {
      active = false;
    };
  }, [detailMode, order]);

  useEffect(() => {
    if (!detailMode && !order && typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hwh_last_order");
        if (saved) {
          setCachedOrder(JSON.parse(saved));
        }
      } catch (e) {}
    }
  }, [order, detailMode]);

  // Active real order from checkout or cache
  const rawOrder = order || cachedOrder || null;

  const displayOrder =
    liveOrderData && rawOrder ? { ...rawOrder, ...liveOrderData } : rawOrder;

  const currentStatus = (displayOrder?.status || ORDER_STATUSES[0]).toLowerCase();

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
      <div
        className="order-placed-wrapper page-width"
        style={{ padding: "80px 20px", textAlign: "center" }}
      >
        {loadingDetail ? (
          <Loader2
            size={40}
            className="spin-animate"
            style={{ margin: "0 auto 18px" }}
          />
        ) : (
          <PackageCheck
            size={56}
            style={{
              color: "var(--forest)",
              opacity: 0.7,
              margin: "0 auto 18px",
            }}
          />
        )}
        <h2
          style={{
            fontSize: "28px",
            color: "var(--forest-deep)",
            marginBottom: "10px",
          }}
        >
          {loadingDetail
            ? "Loading Order Details"
            : detailMode
              ? "Order Not Found"
              : "No Active Order Found"}
        </h2>
        <p
          style={{
            color: "var(--muted)",
            maxWidth: "460px",
            margin: "0 auto 28px",
            fontSize: "15px",
            lineHeight: "1.6",
          }}
        >
          {loadingDetail
            ? "Please wait while we retrieve this order from the database."
            : detailMode
              ? "We could not find this order. Return to your account to choose another order."
              : "We could not find a recently completed order in this session. If you have already placed an order, you can view its live status under your account."}
        </p>
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            className="app-button"
            onClick={() => navigate("account", { tab: "orders" })}
          >
            {detailMode ? "Back to My Orders" : "Go to My Account"}
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

  const orderDate = new Date(
    displayOrder.createdAt || Date.now(),
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const address = displayOrder.shippingAddress || displayOrder.customer || {};
  const firstItemImage = orderProductImage(displayOrder.items?.[0]);
  const additionalItemCount = Math.max(
    0,
    (displayOrder.items?.length || 0) - 1,
  );

  return (
    <div className="order-placed-wrapper page-width">
      {/* =================================================================== */}
      {/* HERO BANNER: Celebration & Confirmation                             */}
      {/* =================================================================== */}
      <div className="order-placed-hero">
        {firstItemImage ? (
          <div className="order-placed-product-cover">
            <img
              src={firstItemImage}
              alt={
                displayOrder.items?.[0]?.titleSnapshot ||
                displayOrder.items?.[0]?.title ||
                "Ordered product"
              }
            />
            <span className="order-product-confirmed">
              <CheckCircle2 size={22} strokeWidth={2.4} />
            </span>
            {additionalItemCount > 0 && (
              <span className="order-product-more">+{additionalItemCount}</span>
            )}
          </div>
        ) : (
          <div className="order-placed-check-circle">
            <CheckCircle2 size={46} strokeWidth={2.2} />
          </div>
        )}
        <span className="order-placed-eyebrow">
          <Sparkles size={14} />{" "}
          {detailMode ? "ORDER DETAILS" : "ORDER CONFIRMED"}
        </span>
        <h1 className="order-placed-title">
          {paymentResult === "failed"
            ? "Payment was not completed"
            : paymentResult === "pending"
              ? "Payment is being confirmed"
              : detailMode
            ? "Your Order Information"
            : "Thank You for Choosing Pure Wellness"}
        </h1>
        <p className="order-placed-subtitle">
          {paymentResult === "failed"
            ? "Your online payment did not complete. Return to checkout to place a new order, or contact support if your account was charged."
            : paymentResult === "pending"
              ? "PayU is still confirming this transaction. Please check your order status again shortly."
              : detailMode
            ? "Review the products, delivery details, payment method, and latest status for this order."
            : "Your order has been safely placed and is now being lovingly prepared by our Ayurvedic apothecarists."}
        </p>

        {/* Order Identifier Tag Box */}
        <div className="order-id-badge-card">
          <div className="order-id-group">
            <span className="order-id-label">Order Reference:</span>
            <strong className="order-id-value">
              {displayOrder.orderNumber}
            </strong>
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
          <h3 className="tracker-card-title">
            Order Status & Dispatch Timeline
          </h3>
          <div className={`tracker-live-indicator status-${currentStatus}`}>
            <span className="live-pulse-dot" />
            <span className="live-status-label">
              Status: <strong>{currentStatus.toUpperCase()}</strong>
            </span>
          </div>
        </div>

        {currentStatus === ORDER_STATUSES[4] ? (
          <div className="order-cancelled-box">
            <XCircle size={22} color="#dc2626" />
            <div>
              <strong>
                This order has been cancelled by the store administrator.
              </strong>
              <p>
                If you have any questions or require assistance, please contact
                our herbal care team.
              </p>
            </div>
          </div>
        ) : (
          <div className="order-steps-grid">
            {STAGES.map((stage, idx) => {
              const state = getStageState(idx, currentStatus);
              const IconComponent = state.isCompleted
                ? CheckCircle2
                : stage.icon;
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
        {(displayOrder.returnExchangeRequests || []).length > 0 && (
          <section className="return-exchange-progress-section" aria-label="Return and exchange status timeline">
            <div className="return-exchange-progress-section-heading">
              <RotateCcw size={16} />
              <h4>Return &amp; exchange progress</h4>
            </div>
            <div className="return-exchange-progress-list">
              {displayOrder.returnExchangeRequests.map((request) => (
                <ReturnExchangeProgress key={request._id} request={request} />
              ))}
            </div>
          </section>
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
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Package size={18} color="var(--forest)" />
                <h2>Items in this Order ({displayOrder.items?.length || 0})</h2>
              </div>
              <span className={`receipt-status-pill status-${currentStatus}`}>
                {currentStatus.toUpperCase()}
              </span>
            </div>

            {currentStatus === ORDER_STATUSES[3] && (
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
            )}

            <div className="order-items-table">
              {(displayOrder.items || []).map((item, idx) => (
                <div key={idx} className="order-placed-item-row">
                  <div className="item-icon-box">
                    {orderProductImage(item) ? (
                      <img
                        className="ordered-product-image"
                        src={orderProductImage(item)}
                        alt={
                          item.titleSnapshot || item.title || "Ordered product"
                        }
                        loading="lazy"
                      />
                    ) : (
                      <Package size={22} />
                    )}
                  </div>
                  <div className="item-text-info">
                    <strong className="item-title">
                      {item.titleSnapshot || item.title}
                    </strong>
                    <span className="item-brand">
                      {item.brandSnapshot || item.brand || "Health with Herbal"}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginTop: "6px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span className="item-qty-tag">
                        Quantity: {item.quantity}
                      </span>
                      {currentStatus === ORDER_STATUSES[3] && (
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
                    {(displayOrder.returnExchangeRequests || [])
                      .filter((request) => isRequestForOrderItem(request, item, idx))
                      .map((request) => (
                        <div className="order-item-return-status" key={request._id}>
                          <div className={`order-item-return-request order-request-${request.status || RETURN_EXCHANGE_STATUSES[0]}`}>
                            <RotateCcw size={14} />
                            <span>{request.type === RETURN_EXCHANGE_TYPES[1] ? "Exchange" : "Return"} request</span>
                            <strong>{statusLabel(request.status || RETURN_EXCHANGE_STATUSES[0])}</strong>
                          </div>
                          <div className={`order-item-refund-status order-refund-${request.refundStatus || REFUND_STATUSES[1]}`}>
                            <span>Refund</span>
                            <strong>{request.refundStatus === REFUND_STATUSES[2] ? "Completed" : request.refundStatus === REFUND_STATUSES[0] ? "Not required" : "Pending"}</strong>
                          </div>
                        </div>
                      ))}
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
                <strong>
                  ₹
                  {displayOrder.subtotal?.toFixed
                    ? displayOrder.subtotal.toFixed(2)
                    : displayOrder.subtotal}
                </strong>
              </div>
              <div className="totals-line">
                <span>Shipping Fee</span>
                <strong>
                  {displayOrder.shipping === 0
                    ? "FREE"
                    : `₹${displayOrder.shipping}`}
                </strong>
              </div>
              {displayOrder.discount > 0 && (
                <div className="totals-line discount">
                  <span>
                    Discount Applied{" "}
                    {displayOrder.couponCode
                      ? `(${displayOrder.couponCode})`
                      : ""}
                  </span>
                  <strong>-₹{displayOrder.discount}</strong>
                </div>
              )}
              <div className="totals-line grand-total">
                <span>Total Amount</span>
                <span className="grand-total-amount">
                  ₹
                  {displayOrder.total?.toFixed
                    ? displayOrder.total.toFixed(2)
                    : displayOrder.total}
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
                No prepayment required. Please keep ₹{displayOrder.total} in
                cash or UPI ready when our courier partner arrives at your
                address.
              </p>
            </div>
          </div>

          {displayOrder.trackingId && (
            <div className="order-info-card">
              <div className="info-card-header">
                <Truck size={17} color="var(--forest)" />
                <h3>Shipment Tracking</h3>
              </div>
              <div className="info-card-body">
                <div className="contact-row">
                  <span>Tracking ID:</span>{" "}
                  <strong>{displayOrder.trackingId}</strong>
                </div>
              </div>
            </div>
          )}

          {displayOrder.billingAddress && (
            <div className="order-info-card">
              <div className="info-card-header">
                <FileText size={17} color="var(--forest)" />
                <h3>Billing Address</h3>
              </div>
              <div className="info-card-body">
                <div className="recipient-name">
                  {displayOrder.billingAddress.firstName}{" "}
                  {displayOrder.billingAddress.lastName}
                </div>
                <p className="address-lines">
                  {displayOrder.billingAddress.street}
                  <br />
                  {displayOrder.billingAddress.city},{" "}
                  {displayOrder.billingAddress.postalCode}
                  <br />
                  {displayOrder.billingAddress.country || "India"}
                </p>
              </div>
            </div>
          )}

          {/* Support / Herbal Guarantee */}
          <div className="order-guarantee-card">
            <Clock size={16} color="var(--forest)" />
            <div>
              <strong>Questions or changes?</strong>
              <p>
                Email us at <em>care@healthwithherbal.com</em> with your order
                reference <strong>{displayOrder.orderNumber}</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* BOTTOM ACTIONS                                                      */}
      {/* =================================================================== */}
      {detailMode && currentStatus === ORDER_STATUSES[3] && (
        <section className="return-exchange-panel">
          <div>
            <span className="return-exchange-eyebrow">
              Delivered order support
            </span>
            <h2>Need a return or exchange?</h2>
            <p>
              Unopened and unused products in new condition, with original
              packaging and accessories, can be requested for a 100% refund
              within 10 days of receipt. Buyers pay return shipping, insurance,
              and any duties. Please contact us before mailing anything back.
            </p>
          </div>
          <button
            type="button"
            className="app-button"
            onClick={() => openContent?.("Contact Us", { orderNumber: displayOrder.orderNumber || displayOrder._id })}
          >
            Request return or exchange
          </button>
        </section>
      )}
      <div className="order-placed-actions-row">
        {detailMode && currentStatus === ORDER_STATUSES[3] && (
          <button
            type="button"
            className="app-button continue-btn"
            onClick={() =>
              navigate("order-invoice", {
                orderId: displayOrder.orderNumber || displayOrder._id,
              })
            }
          >
            <FileText size={17} /> Generate Invoice
          </button>
        )}
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
          onClick={() => navigate("account", { tab: "orders" })}
        >
          {detailMode ? "Back to My Orders" : "View in My Orders"}{" "}
          <ArrowRight size={16} />
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
