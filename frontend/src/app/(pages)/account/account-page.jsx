"use client";
import { useEffect, useState } from "react";
import {
  Inbox,
  ShoppingBag,
  MapPin,
  LogOut,
  ChevronRight,
  Package,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  Calendar,
  CreditCard,
  FileText,
  Printer,
  Star,
  Sparkles,
  Pencil,
  RotateCcw,
} from "lucide-react";
import {
  fetchUserOrders,
  fetchUserAddresses,
  saveUserAddress,
  updateUserAddress,
  deleteUserAddress,
  submitReturnExchangeRequest,
  uploadReturnExchangePhotos,
} from "@/lib/api";
import { ProductReviewModal, ConfirmModal } from "@/components/pages/modals";
import { FormModal } from "../../../components/admin/global/FormModal";

const returnRequestMatchesItem = (request, item, itemIndex) => {
  if (Number.isInteger(request.itemIndex)) return request.itemIndex === itemIndex;
  return String(request.item?.title || "").trim().toLowerCase() === String(item.title || "").trim().toLowerCase();
};

export function AccountPage({
  currentUser,
  initialTab = "overview",
  onViewOrder,
  onLogout,
  navigate,
  openContent,
  openAuthModal,
  notify,
  returnExchangeEnabled = true,
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [reviewModalData, setReviewModalData] = useState(null);
  const [returnRequestData, setReturnRequestData] = useState(null);
  const [returnRequestType, setReturnRequestType] = useState("return");
  const [returnRequestQuantity, setReturnRequestQuantity] = useState(1);
  const [returnRequestReason, setReturnRequestReason] = useState("");
  const [savingReturnRequest, setSavingReturnRequest] = useState(false);
  const [returnRequestPhotos, setReturnRequestPhotos] = useState([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [deletingAddress, setDeletingAddress] = useState(false);

  const sendReturnRequest = async (event) => {
    event.preventDefault();
    if (!returnRequestData) return;
    setSavingReturnRequest(true);
    try {
      const photoUrls = returnRequestPhotos.length
        ? await uploadReturnExchangePhotos(returnRequestPhotos)
        : [];
      const orderNumber = returnRequestData.order.orderNumber;
      const itemTitle = returnRequestData.item.title;
      if (returnExchangeEnabled) {
        const result = await submitReturnExchangeRequest({
          orderNumber,
          email: currentUser?.email || returnRequestData.order.customer?.email,
          itemIndex: returnRequestData.itemIndex,
          quantity: Number(returnRequestQuantity),
          type: returnRequestType,
          reason: returnRequestReason,
          photoUrls,
        });
        if (result.request) {
          setOrders((current) => current.map((order) => order.orderNumber === orderNumber
            ? { ...order, returnExchangeRequests: [...(order.returnExchangeRequests || []), result.request] }
            : order));
        }
        notify?.("Your request has been submitted for review.");
      } else {
        const subject = `${returnRequestType === "return" ? "Return" : "Exchange"} request for order ${orderNumber}`;
        const body = `Hello,\n\nI would like to request a ${returnRequestType}.\nOrder: ${orderNumber}\nItem: ${itemTitle}\nQuantity: ${returnRequestQuantity}\nReason: ${returnRequestReason || "Not provided"}\n${photoUrls.length ? `Photo links:\n${photoUrls.join("\n")}\n` : ""}\nPlease let me know the next steps.`;
        window.location.href = `mailto:healthwithherbalindia@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }
      setReturnRequestData(null);
      setReturnRequestReason("");
      setReturnRequestPhotos([]);
    } catch (error) {
      notify?.(error.message);
    } finally {
      setSavingReturnRequest(false);
    }
  };

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Address modal state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setShowAddAddress(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddress(addr);
    setShowAddAddress(true);
  };

  // Load orders and addresses whenever currentUser changes
  useEffect(() => {
    if (!currentUser) return;

    let active = true;
    setLoadingOrders(true);
    setLoadingAddresses(true);

    const query = {
      phone: currentUser.phone || "",
      email: currentUser.email || "",
      userId: currentUser._id || "",
    };

    fetchUserOrders(query)
      .then((data) => {
        if (active) setOrders(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to load user orders:", err);
      })
      .finally(() => {
        if (active) setLoadingOrders(false);
      });

    fetchUserAddresses(query)
      .then((data) => {
        if (active) setAddresses(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to load user addresses:", err);
      })
      .finally(() => {
        if (active) setLoadingAddresses(false);
      });

    return () => {
      active = false;
    };
  }, [currentUser?.phone, currentUser?.email, currentUser?._id]);

  // Real-time synchronization for order status updates from admin
  useEffect(() => {
    let bc = null;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        bc = new BroadcastChannel("hwh_order_status");
        bc.onmessage = (e) => {
          const { id, status } = e.data || {};
          if (id && status) {
            setOrders((prev) =>
              prev.map((o) =>
                o._id === id || o.orderNumber === id ? { ...o, status } : o,
              ),
            );
          }
        };
      }
    } catch {}

    const handleStorage = (e) => {
      if (e.key === "hwh_order_status_update" && e.newValue) {
        try {
          const { id, status } = JSON.parse(e.newValue);
          if (id && status) {
            setOrders((prev) =>
              prev.map((o) =>
                o._id === id || o.orderNumber === id ? { ...o, status } : o,
              ),
            );
          }
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      bc?.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Handle saving new or updated address via modal
  const handleSaveAddress = async (formData) => {
    if (
      !formData.fullName?.trim() ||
      !formData.line1?.trim() ||
      !formData.city?.trim() ||
      !formData.postalCode?.trim()
    ) {
      if (notify) notify("Please fill all required address fields.");
      return;
    }

    setSavingAddress(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone?.trim() || currentUser?.phone || "",
        line1: formData.line1.trim(),
        line2: formData.line2?.trim() || "",
        city: formData.city.trim(),
        state: formData.state?.trim() || "",
        postalCode: formData.postalCode.trim(),
        country: formData.country?.trim() || "India",
        tag: formData.tag || "Home",
        isDefault: Boolean(formData.isDefault),
        userPhone: currentUser?.phone || formData.phone || "",
        userEmail: currentUser?.email || "",
        userId: currentUser?._id || null,
      };

      if (editingAddress?._id) {
        const updated = await updateUserAddress(editingAddress._id, payload);
        setAddresses((prev) =>
          prev.map((a) => (a._id === updated._id ? updated : a)),
        );
        if (notify) notify("Address updated successfully!");
      } else {
        const newAddr = await saveUserAddress({
          ...payload,
          isDefault: payload.isDefault ?? addresses.length === 0,
        });
        setAddresses((prev) => [newAddr, ...prev]);
        if (notify) notify("Address saved successfully!");
      }

      setShowAddAddress(false);
      setEditingAddress(null);
    } catch (err) {
      if (notify) notify(err.message || "Failed to save address.");
    } finally {
      setSavingAddress(false);
    }
  };

  // Handle delete address
  const handleDeleteAddress = async (id) => {
    try {
      await deleteUserAddress(id);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
      if (notify) notify("Address removed.");
    } catch (err) {
      if (notify) notify(err.message || "Could not delete address.");
    }
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete?._id) return;
    setDeletingAddress(true);
    try {
      await handleDeleteAddress(addressToDelete._id);
      setAddressToDelete(null);
    } finally {
      setDeletingAddress(false);
    }
  };

  // If user is not logged in, prompt to log in
  if (!currentUser) {
    return (
      <div className="account-page-wrapper page-width">
        <div className="account-logged-out-card">
          <div className="account-avatar-placeholder">
            <ShoppingBag size={32} />
          </div>
          <h2>Please Log In</h2>
          <p>Sign in to view your orders, addresses, and account details.</p>
          <button
            type="button"
            className="app-button"
            style={{ marginTop: "16px", minWidth: "200px" }}
            onClick={openAuthModal}
          >
            Log In or Sign Up
          </button>
        </div>
      </div>
    );
  }

  const cleanPhone = (currentUser.phone || "").replace(/\D/g, "").slice(-10);
  const displayPhone = cleanPhone ? `+91 ${cleanPhone}` : currentUser.email;
  const initial = (currentUser.name || "User").trim().charAt(0).toUpperCase();

  return (
    <div className="account-page-wrapper page-width">
      <div className="account-layout-grid">
        {/* ================================================================= */}
        {/* LEFT SIDEBAR                                                      */}
        {/* ================================================================= */}
        <aside className="account-sidebar">
          {/* User profile card */}
          <div className="account-user-card">
            <div className="account-user-card-top">
              <div className="account-user-meta">
                <div className="account-user-greeting">
                  <strong>Hey, {currentUser.name || "User"}</strong>
                  <ChevronRight size={16} />
                </div>
                <div className="account-user-phone">
                  Logged with {displayPhone}
                </div>
              </div>
              <div className="account-avatar-badge">{initial}</div>
            </div>

            <div className="account-stat-box">
              <div className="account-stat-num">{orders.length}</div>
              <div className="account-stat-label">Total Orders</div>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="account-nav-group">
            <div className="account-nav-heading">Account</div>

            <button
              type="button"
              className={`account-nav-item ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <span className="account-nav-icon">
                <Inbox size={19} />
              </span>
              <div className="account-nav-text">
                <span className="account-nav-title">Overview</span>
                <span className="account-nav-sub">
                  All details at one place, easy to access
                </span>
              </div>
              <ChevronRight size={16} className="account-nav-arrow" />
            </button>

            <button
              type="button"
              className={`account-nav-item ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <span className="account-nav-icon">
                <ShoppingBag size={19} />
              </span>
              <div className="account-nav-text">
                <span className="account-nav-title">My Orders</span>
                <span className="account-nav-sub">
                  Track your recent purchases
                </span>
              </div>
              <ChevronRight size={16} className="account-nav-arrow" />
            </button>

            <button
              type="button"
              className={`account-nav-item ${activeTab === "addresses" ? "active" : ""}`}
              onClick={() => setActiveTab("addresses")}
            >
              <span className="account-nav-icon">
                <MapPin size={19} />
              </span>
              <div className="account-nav-text">
                <span className="account-nav-title">My Address</span>
                <span className="account-nav-sub">
                  Manage shipping addresses
                </span>
              </div>
              <ChevronRight size={16} className="account-nav-arrow" />
            </button>

            <button
              type="button"
              className="account-nav-item account-logout-item"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <span className="account-nav-icon logout-icon">
                <LogOut size={19} />
              </span>
              <div className="account-nav-text">
                <span className="account-nav-title logout-text">Logout</span>
              </div>
            </button>
          </div>
        </aside>

        {/* ================================================================= */}
        {/* RIGHT MAIN CONTENT AREA                                           */}
        {/* ================================================================= */}
        <main className="account-main-content">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="account-tab-content">
              <h1 className="account-view-title">Overview</h1>

              {/* SECTION: My Orders Overview */}
              <div className="account-overview-section">
                <div className="account-section-header">
                  <h2 className="account-section-title">My Orders</h2>
                  {orders.length > 0 && (
                    <button
                      type="button"
                      className="account-view-all-link"
                      onClick={() => setActiveTab("orders")}
                    >
                      View All ({orders.length}) →
                    </button>
                  )}
                </div>

                {loadingOrders ? (
                  <div className="account-loading-box">
                    <Loader2 size={24} className="spin-animate" />
                    <span>Loading past orders...</span>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="account-empty-card">
                    <div className="account-empty-icon-box">
                      <div className="mock-box-3d">
                        <Package size={34} />
                      </div>
                    </div>
                    <div className="account-empty-card-content">
                      <h3 className="account-empty-title">
                        No Past Orders Yet
                      </h3>
                      <p className="account-empty-desc">
                        Start your first order to see it here.{" "}
                        <button
                          type="button"
                          className="account-inline-cta"
                          onClick={() => navigate("shop")}
                        >
                          Shop Now
                        </button>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="account-orders-preview-list">
                    {orders.slice(0, 2).map((order) => (
                      <div key={order._id} className="account-order-card">
                        <div className="order-card-header">
                          <div>
                            <span className="order-num-tag">
                              {order.orderNumber}
                            </span>
                            <span className="order-date-tag">
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>
                          <span
                            className={`order-status-pill status-${order.status || "placed"}`}
                          >
                            {order.status || "Confirmed"}
                          </span>
                        </div>

                        <div className="order-items-snippet">
                          {(order.items || []).map((item, idx) => (
                            <div
                              key={idx}
                              className="order-item-mini"
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <div>
                                <span className="item-name">{item.title}</span>
                                <span className="item-qty-price">
                                  Qty: {item.quantity} × ₹{item.unitPrice}
                                </span>
                              </div>
                              {(order.status || "").toLowerCase() ===
                                "delivered" && (
                                <button
                                  type="button"
                                  className="item-review-btn"
                                  style={{
                                    padding: "3px 8px",
                                    fontSize: "11px",
                                    whiteSpace: "nowrap",
                                  }}
                                  onClick={() =>
                                    setReviewModalData({ item, order })
                                  }
                                  title={`Review ${item.title}`}
                                >
                                  <Star
                                    size={11}
                                    fill="#f59e0b"
                                    color="#f59e0b"
                                  />{" "}
                                  Review
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="order-card-footer">
                          <span className="order-total-label">
                            Total: <strong>₹{order.total}</strong>
                          </span>
                          <button
                            type="button"
                            className="order-detail-btn"
                            onClick={() => onViewOrder?.(order)}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION: Saved Addresses Overview */}
              <div
                className="account-overview-section"
                style={{ marginTop: "32px" }}
              >
                <div className="account-section-header">
                  <h2 className="account-section-title">Saved Addresses</h2>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      className="account-view-all-link"
                      onClick={() => setActiveTab("addresses")}
                    >
                      Manage ({addresses.length}) →
                    </button>
                  )}
                </div>

                {loadingAddresses ? (
                  <div className="account-loading-box">
                    <Loader2 size={24} className="spin-animate" />
                    <span>Loading saved addresses...</span>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="account-empty-card">
                    <div className="account-empty-icon-box">
                      <div className="mock-pin-3d">
                        <MapPin size={34} />
                      </div>
                    </div>
                    <div className="account-empty-card-content">
                      <h3 className="account-empty-title">
                        No Address Saved Yet
                      </h3>
                      <p className="account-empty-desc">
                        Tap to add and shop faster{" "}
                        <button
                          type="button"
                          className="account-inline-cta"
                          onClick={() => {
                            setActiveTab("addresses");
                            handleOpenAddAddress();
                          }}
                        >
                          Add New Address Now
                        </button>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="account-address-card default-addr-preview">
                    <div className="address-card-header">
                      <span className="address-tag-pill">
                        {addresses[0].tag || "Home"}
                      </span>
                      {addresses[0].isDefault && (
                        <span className="address-default-badge">
                          <CheckCircle2 size={13} /> Default Delivery Address
                        </span>
                      )}
                    </div>
                    <div className="address-recipient">
                      {addresses[0].fullName}
                    </div>
                    <div className="address-lines">
                      {addresses[0].line1}
                      {addresses[0].line2
                        ? `, ${addresses[0].line2}`
                        : ""}, {addresses[0].city}, {addresses[0].state || ""} -{" "}
                      {addresses[0].postalCode}
                    </div>
                    <div className="address-phone">
                      Phone: {addresses[0].phone}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MY ORDERS */}
          {activeTab === "orders" && (
            <div className="account-tab-content">
              <div className="account-section-header">
                <div>
                  <h1 className="account-view-title">My Orders</h1>
                  <p className="account-view-sub">
                    Showing all orders placed from your verified account.
                  </p>
                </div>
              </div>

              {loadingOrders ? (
                <div className="account-loading-box">
                  <Loader2 size={28} className="spin-animate" />
                  <span>Loading order history from database...</span>
                </div>
              ) : orders.length === 0 ? (
                <div
                  className="account-empty-card"
                  style={{ marginTop: "24px" }}
                >
                  <div className="account-empty-icon-box">
                    <div className="mock-box-3d">
                      <Package size={38} />
                    </div>
                  </div>
                  <div className="account-empty-card-content">
                    <h3 className="account-empty-title">No Orders Found</h3>
                    <p className="account-empty-desc">
                      You haven’t placed any orders yet. Discover our pure
                      Ayurvedic remedies today.
                    </p>
                    <button
                      type="button"
                      className="app-button"
                      style={{ marginTop: "14px" }}
                      onClick={() => navigate("shop")}
                    >
                      Start Shopping
                    </button>
                  </div>
                </div>
              ) : (
                <div className="account-orders-full-list">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="account-order-card full-order-card"
                    >
                      <div className="order-card-header">
                        <div className="order-meta-info">
                          <span className="order-num-tag">
                            {order.orderNumber}
                          </span>
                          <span className="order-date-tag">
                            <Calendar size={13} />
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                        <span
                          className={`order-status-pill status-${order.status || "placed"}`}
                        >
                          {order.status
                            ? order.status.toUpperCase()
                            : "CONFIRMED"}
                        </span>
                      </div>

                      {(order.status || "").toLowerCase() === "delivered" && (
                        <div
                          className="delivered-review-callout"
                          style={{ margin: "10px 0 14px" }}
                        >
                          <div className="callout-icon-box">
                            <Sparkles size={16} color="#15803d" />
                          </div>
                          <div className="callout-text">
                            <strong>Order Delivered!</strong>
                            <p>
                              Share your authentic experience with the herbal
                              products below. Your feedback helps our community!
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Items */}
                      <div className="order-items-grid">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="order-item-detailed">
                            <div className="order-item-img-placeholder">
                              <Package size={20} />
                            </div>
                            <div className="order-item-info">
                              <div className="item-title">{item.title}</div>
                              <div className="item-brand">
                                {item.brand || "Health with Herbal"}
                              </div>
                              <div className="item-qty">
                                Qty: {item.quantity}
                              </div>
                              {(order.returnExchangeRequests || [])
                                .filter((request) => returnRequestMatchesItem(request, item, idx))
                                .map((request) => (
                                  <div key={request._id} className={`customer-return-status customer-return-status-${request.status || "pending"}`}>
                                    <RotateCcw size={13} />
                                    <span>{request.type === "exchange" ? "Exchange" : "Return"} request</span>
                                    <strong>{(request.status || "pending").charAt(0).toUpperCase() + (request.status || "pending").slice(1)}</strong>
                                  </div>
                                ))}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-end",
                                gap: "6px",
                              }}
                            >
                              <div className="order-item-price">
                                ₹
                                {item.lineTotal ||
                                  item.unitPrice * item.quantity}
                              </div>
                              {(order.status || "").toLowerCase() ===
                                "delivered" && (
                                <>
                                  <button
                                    type="button"
                                    className="item-review-btn"
                                    onClick={() =>
                                      setReviewModalData({ item, order })
                                    }
                                    title={`Review ${item.title}`}
                                  >
                                    <Star
                                      size={12}
                                      fill="#f59e0b"
                                      color="#f59e0b"
                                    />
                                    <span>Review Product</span>
                                  </button>
                                  {(order.returnExchangeRequests || []).some((request) => returnRequestMatchesItem(request, item, idx)) ? (
                                    <span className="item-review-btn return-exchange-request-btn is-submitted" aria-label="Return or exchange request already submitted">
                                      <CheckCircle2 size={13} />
                                      <span>Request submitted</span>
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      className="item-review-btn return-exchange-request-btn"
                                      onClick={() => {
                                        setReturnRequestData({ item, order, itemIndex: idx });
                                        setReturnRequestQuantity(1);
                                        setReturnRequestType("return");
                                        setReturnRequestReason("");
                                        setReturnRequestPhotos([]);
                                      }}
                                    >
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

                      {/* Summary Breakdown */}
                      <div className="order-summary-breakdown">
                        <div className="summary-row">
                          <span>Subtotal:</span>
                          <span>₹{order.subtotal}</span>
                        </div>
                        <div className="summary-row">
                          <span>Shipping:</span>
                          <span>
                            {order.shipping === 0
                              ? "FREE"
                              : `₹${order.shipping}`}
                          </span>
                        </div>
                        {order.discount > 0 && (
                          <div className="summary-row discount">
                            <span>
                              Discount{" "}
                              {order.couponCode ? `(${order.couponCode})` : ""}:
                            </span>
                            <span>-₹{order.discount}</span>
                          </div>
                        )}
                        <div className="summary-row grand-total">
                          <span>Total Paid:</span>
                          <span className="total-highlight">
                            ₹{order.total}
                          </span>
                        </div>
                      </div>

                      {/* Details row: Address & Note */}
                      <div className="order-details-bottom-row">
                        {order.shippingAddress && (
                          <div className="order-delivery-snapshot">
                            <strong>Delivery Address:</strong>
                            <p>
                              {order.shippingAddress.firstName}{" "}
                              {order.shippingAddress.lastName} <br />
                              {order.shippingAddress.street},{" "}
                              {order.shippingAddress.city} -{" "}
                              {order.shippingAddress.postalCode}
                            </p>
                          </div>
                        )}

                        {order.orderNote && (
                          <div className="order-delivery-note">
                            <FileText size={15} />
                            <span>
                              <strong>Note:</strong> {order.orderNote}
                            </span>
                          </div>
                        )}

                        <div className="order-payment-badge">
                          <CreditCard size={15} />
                          <span>
                            {order.paymentMethod === "cash_on_delivery"
                              ? "Cash on Delivery"
                              : "Online Payment"}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="order-view-receipt-action"
                          onClick={() => onViewOrder?.(order)}
                        >
                          <FileText size={13} /> View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MY ADDRESSES */}
          {activeTab === "addresses" && (
            <div className="account-tab-content">
              <div className="account-section-header">
                <div>
                  <h1 className="account-view-title">My Addresses</h1>
                  <p className="account-view-sub">
                    Manage your delivery addresses for seamless checkout.
                  </p>
                </div>
                <button
                  type="button"
                  className="app-button add-address-btn"
                  onClick={handleOpenAddAddress}
                >
                  <Plus size={16} /> Add New Address
                </button>
              </div>

              {/* Addresses List */}
              {loadingAddresses ? (
                <div className="account-loading-box">
                  <Loader2 size={28} className="spin-animate" />
                  <span>Loading saved addresses from database...</span>
                </div>
              ) : addresses.length === 0 ? (
                <div
                  className="account-empty-card"
                  style={{ marginTop: "24px" }}
                >
                  <div className="account-empty-icon-box">
                    <div className="mock-pin-3d">
                      <MapPin size={38} />
                    </div>
                  </div>
                  <div className="account-empty-card-content">
                    <h3 className="account-empty-title">No Saved Addresses</h3>
                    <p className="account-empty-desc">
                      Add your shipping address for one-click checkout.
                    </p>
                    <button
                      type="button"
                      className="app-button"
                      style={{ marginTop: "14px" }}
                      onClick={handleOpenAddAddress}
                    >
                      <Plus size={16} /> Add Address
                    </button>
                  </div>
                </div>
              ) : (
                <div className="account-addresses-grid">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`account-address-card ${addr.isDefault ? "is-default" : ""}`}
                    >
                      <div className="address-card-header">
                        <span className="address-tag-pill">
                          {addr.tag || "Home"}
                        </span>
                        {addr.isDefault && (
                          <span className="address-default-badge">
                            <CheckCircle2 size={13} /> Default
                          </span>
                        )}
                      </div>

                      <div className="address-recipient">{addr.fullName}</div>
                      <div className="address-lines">
                        {addr.line1}
                        {addr.line2 ? `, ${addr.line2}` : ""}, <br />
                        {addr.city}, {addr.state ? `${addr.state} - ` : ""}
                        {addr.postalCode}
                        <br />
                        {addr.country || "India"}
                      </div>
                      <div className="address-phone">Phone: {addr.phone}</div>

                      <div className="address-card-actions">
                        <button
                          type="button"
                          className="address-edit-btn"
                          onClick={() => handleOpenEditAddress(addr)}
                          title="Edit address"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          className="address-delete-btn"
                          onClick={() => setAddressToDelete(addr)}
                          title="Delete address"
                        >
                          <Trash2 size={15} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add / Edit Address Pop-up Modal (Powered by FormModal & Modal) */}
              <FormModal
                entity="address"
                isOpen={showAddAddress}
                initial={
                  editingAddress || {
                    fullName: currentUser?.name || "",
                    phone: currentUser?.phone || "",
                    country: "India",
                    tag: "Home",
                    isDefault: addresses.length === 0,
                  }
                }
                onSave={handleSaveAddress}
                onClose={() => {
                  setShowAddAddress(false);
                  setEditingAddress(null);
                }}
                busy={savingAddress}
                submitLabel={editingAddress ? "Save Changes" : "Save Address"}
                className="checkout-address-form-modal address-modal-popup"
              />
            </div>
          )}
        </main>
      </div>

      {/* Product Review Modal for Delivered Orders */}
      <ProductReviewModal
        isOpen={Boolean(reviewModalData)}
        onClose={() => setReviewModalData(null)}
        product={reviewModalData?.item}
        order={reviewModalData?.order}
        currentUser={currentUser}
        onSubmitted={() => {
          notify?.("Review submitted! Thank you for sharing your feedback.");
        }}
      />
      {returnRequestData && (
        <div
          className="return-request-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget && !savingReturnRequest)
              setReturnRequestData(null);
          }}
        >
          <form className="return-request-modal" onSubmit={sendReturnRequest}>
            <div className="return-request-heading">
              <div>
                <span>ORDER {returnRequestData.order.orderNumber}</span>
                <h2>Return or exchange</h2>
              </div>
              <button type="button" onClick={() => setReturnRequestData(null)} aria-label="Close request form">×</button>
            </div>
            <p className="return-request-product">
              {returnExchangeEnabled
                ? "Submit your request for review by our care team."
                : "Your email app will open with your request. Photo links will be included."}
            </p>
            <p className="return-request-product">
              {returnRequestData.item.title} · Ordered quantity {returnRequestData.item.quantity}
            </p>
            <label>Request type
              <select value={returnRequestType} onChange={(event) => setReturnRequestType(event.target.value)}>
                <option value="return">Return</option><option value="exchange">Exchange</option>
              </select>
            </label>
            <label>Quantity
              <select value={returnRequestQuantity} onChange={(event) => setReturnRequestQuantity(event.target.value)}>
                {Array.from({ length: returnRequestData.item.quantity }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}
              </select>
            </label>
            <label>Reason
              <textarea required minLength={5} maxLength={1000} rows={4} value={returnRequestReason} onChange={(event) => setReturnRequestReason(event.target.value)} placeholder="Tell us why you are requesting a return or exchange" />
            </label>
            <label className="return-request-photo-field">Photos (optional, up to 4)
              <input type="file" accept="image/*" multiple disabled={savingReturnRequest} onChange={(event) => {
                const nextFiles = Array.from(event.target.files || []);
                if (nextFiles.some((file) => file.size > 5 * 1024 * 1024)) {
                  notify?.("Each photo must be 5 MB or smaller.");
                  event.target.value = "";
                  return;
                }
                setReturnRequestPhotos((current) => [...current, ...nextFiles].slice(0, 4));
                event.target.value = "";
              }} />
              <small>Add photos of the item or issue. JPG, PNG, or WebP; 5 MB max each.</small>
            </label>
            {returnRequestPhotos.length > 0 && <div className="return-request-photo-list">{returnRequestPhotos.map((photo, index) => (
              <div key={`${photo.name}-${photo.lastModified}`}><span>{photo.name}</span><button type="button" disabled={savingReturnRequest} onClick={() => setReturnRequestPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))} aria-label={`Remove ${photo.name}`}>Remove</button></div>
            ))}</div>}
            <footer>
              <button type="button" onClick={() => setReturnRequestData(null)} disabled={savingReturnRequest}>Cancel</button>
              <button type="submit" disabled={savingReturnRequest}>{savingReturnRequest ? "Uploading…" : returnExchangeEnabled ? "Submit request" : "Continue to email"}</button>
            </footer>
          </form>
        </div>
      )}
      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          onLogout?.();
        }}
        title="Log Out?"
        message="Are you sure you want to log out of your account?"
        confirmLabel="Log Out"
        variant="warning"
      />

      {/* Delete Address Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(addressToDelete)}
        onClose={() => setAddressToDelete(null)}
        onConfirm={confirmDeleteAddress}
        loading={deletingAddress}
        title="Delete Address?"
        message={`Are you sure you want to remove the saved address for ${addressToDelete?.fullName || "this recipient"}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
