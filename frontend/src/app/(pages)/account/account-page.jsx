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
} from "lucide-react";
import {
  fetchUserOrders,
  fetchUserAddresses,
  saveUserAddress,
  deleteUserAddress,
} from "../../../lib/api";
import { ProductReviewModal } from "../../../components/global";

export function AccountPage({
  currentUser,
  onLogout,
  navigate,
  openAuthModal,
  notify,
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [reviewModalData, setReviewModalData] = useState(null);

  // Address form modal / toggle state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addrForm, setAddrForm] = useState({
    fullName: currentUser?.name || "",
    phone: currentUser?.phone || "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    tag: "Home",
    isDefault: true,
  });

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
  }, [currentUser]);

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

    // Periodic poll when viewing orders tab
    let pollInterval = null;
    if (currentUser) {
      pollInterval = setInterval(() => {
        fetchUserOrders({
          phone: currentUser.phone || "",
          email: currentUser.email || "",
          userId: currentUser._id || "",
        })
          .then((data) => {
            if (Array.isArray(data)) setOrders(data);
          })
          .catch(() => {});
      }, 5000);
    }

    return () => {
      bc?.close();
      window.removeEventListener("storage", handleStorage);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [currentUser, activeTab]);

  // Handle saving new address
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addrForm.fullName || !addrForm.line1 || !addrForm.city || !addrForm.postalCode) {
      if (notify) notify("Please fill all required address fields.");
      return;
    }

    setSavingAddress(true);
    try {
      const newAddr = await saveUserAddress({
        ...addrForm,
        userPhone: currentUser?.phone || addrForm.phone,
        userEmail: currentUser?.email || "",
        userId: currentUser?._id || null,
      });

      setAddresses((prev) => [newAddr, ...prev]);
      setShowAddAddress(false);
      setAddrForm({
        fullName: currentUser?.name || "",
        phone: currentUser?.phone || "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        tag: "Home",
        isDefault: false,
      });
      if (notify) notify("Address saved successfully!");
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
              onClick={onLogout}
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
                      <h3 className="account-empty-title">No Past Orders Yet</h3>
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
                            <span className="order-num-tag">{order.orderNumber}</span>
                            <span className="order-date-tag">
                              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <span className={`order-status-pill status-${order.status || "placed"}`}>
                            {order.status || "Confirmed"}
                          </span>
                        </div>

                        <div className="order-items-snippet">
                          {(order.items || []).map((item, idx) => (
                            <div key={idx} className="order-item-mini" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                              <div>
                                <span className="item-name">{item.title}</span>
                                <span className="item-qty-price">
                                  Qty: {item.quantity} × ₹{item.unitPrice}
                                </span>
                              </div>
                              {(order.status || "").toLowerCase() === "delivered" && (
                                <button
                                  type="button"
                                  className="item-review-btn"
                                  style={{ padding: "3px 8px", fontSize: "11px", whiteSpace: "nowrap" }}
                                  onClick={() => setReviewModalData({ item, order })}
                                  title={`Review ${item.title}`}
                                >
                                  <Star size={11} fill="#f59e0b" color="#f59e0b" /> Review
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="order-card-footer">
                          <span className="order-total-label">Total: <strong>₹{order.total}</strong></span>
                          <button
                            type="button"
                            className="order-detail-btn"
                            onClick={() => setActiveTab("orders")}
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
              <div className="account-overview-section" style={{ marginTop: "32px" }}>
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
                      <h3 className="account-empty-title">No Address Saved Yet</h3>
                      <p className="account-empty-desc">
                        Tap to add and shop faster{" "}
                        <button
                          type="button"
                          className="account-inline-cta"
                          onClick={() => {
                            setActiveTab("addresses");
                            setShowAddAddress(true);
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
                      <span className="address-tag-pill">{addresses[0].tag || "Home"}</span>
                      {addresses[0].isDefault && (
                        <span className="address-default-badge">
                          <CheckCircle2 size={13} /> Default Delivery Address
                        </span>
                      )}
                    </div>
                    <div className="address-recipient">{addresses[0].fullName}</div>
                    <div className="address-lines">
                      {addresses[0].line1}
                      {addresses[0].line2 ? `, ${addresses[0].line2}` : ""},{" "}
                      {addresses[0].city}, {addresses[0].state || ""} - {addresses[0].postalCode}
                    </div>
                    <div className="address-phone">Phone: {addresses[0].phone}</div>
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
                <div className="account-empty-card" style={{ marginTop: "24px" }}>
                  <div className="account-empty-icon-box">
                    <div className="mock-box-3d">
                      <Package size={38} />
                    </div>
                  </div>
                  <div className="account-empty-card-content">
                    <h3 className="account-empty-title">No Orders Found</h3>
                    <p className="account-empty-desc">
                      You haven’t placed any orders yet. Discover our pure Ayurvedic remedies today.
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
                    <div key={order._id} className="account-order-card full-order-card">
                      <div className="order-card-header">
                        <div className="order-meta-info">
                          <span className="order-num-tag">{order.orderNumber}</span>
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
                        <span className={`order-status-pill status-${order.status || "placed"}`}>
                          {order.status ? order.status.toUpperCase() : "CONFIRMED"}
                        </span>
                      </div>

                      {(order.status || "").toLowerCase() === "delivered" && (
                        <div className="delivered-review-callout" style={{ margin: "10px 0 14px" }}>
                          <div className="callout-icon-box">
                            <Sparkles size={16} color="#15803d" />
                          </div>
                          <div className="callout-text">
                            <strong>Order Delivered!</strong>
                            <p>
                              Share your authentic experience with the herbal products below. Your feedback helps our community!
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
                              <div className="item-brand">{item.brand || "Health with Herbal"}</div>
                              <div className="item-qty">Qty: {item.quantity}</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                              <div className="order-item-price">
                                ₹{item.lineTotal || item.unitPrice * item.quantity}
                              </div>
                              {(order.status || "").toLowerCase() === "delivered" && (
                                <button
                                  type="button"
                                  className="item-review-btn"
                                  onClick={() => setReviewModalData({ item, order })}
                                  title={`Review ${item.title}`}
                                >
                                  <Star size={12} fill="#f59e0b" color="#f59e0b" />
                                  <span>Review Product</span>
                                </button>
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
                          <span>{order.shipping === 0 ? "FREE" : `₹${order.shipping}`}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="summary-row discount">
                            <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}:</span>
                            <span>-₹{order.discount}</span>
                          </div>
                        )}
                        <div className="summary-row grand-total">
                          <span>Total Paid:</span>
                          <span className="total-highlight">₹{order.total}</span>
                        </div>
                      </div>

                      {/* Details row: Address & Note */}
                      <div className="order-details-bottom-row">
                        {order.shippingAddress && (
                          <div className="order-delivery-snapshot">
                            <strong>Delivery Address:</strong>
                            <p>
                              {order.shippingAddress.firstName} {order.shippingAddress.lastName} <br />
                              {order.shippingAddress.street}, {order.shippingAddress.city} -{" "}
                              {order.shippingAddress.postalCode}
                            </p>
                          </div>
                        )}

                        {order.orderNote && (
                          <div className="order-delivery-note">
                            <FileText size={15} />
                            <span><strong>Note:</strong> {order.orderNote}</span>
                          </div>
                        )}

                        <div className="order-payment-badge">
                          <CreditCard size={15} />
                          <span>{order.paymentMethod === "cash_on_delivery" ? "Cash on Delivery" : "Online Payment"}</span>
                        </div>

                        <button
                          type="button"
                          className="order-view-receipt-action"
                          onClick={() => {
                            try {
                              localStorage.setItem("hwh_last_order", JSON.stringify(order));
                            } catch (e) {}
                            navigate("order-placed");
                          }}
                        >
                          <Printer size={13} /> View Order Receipt
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
                {!showAddAddress && (
                  <button
                    type="button"
                    className="app-button add-address-btn"
                    onClick={() => setShowAddAddress(true)}
                  >
                    <Plus size={16} /> Add New Address
                  </button>
                )}
              </div>

              {/* Add Address Form Drawer/Box */}
              {showAddAddress && (
                <div className="add-address-form-box">
                  <div className="form-box-header">
                    <h3>Add New Address</h3>
                    <button
                      type="button"
                      className="form-close-btn"
                      onClick={() => setShowAddAddress(false)}
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSaveAddress} className="add-address-form">
                    <div className="form-row-2">
                      <label className="auth-label">
                        <span>Full Name <span className="required-star">*</span></span>
                        <input
                          type="text"
                          required
                          value={addrForm.fullName}
                          onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })}
                          className="auth-input"
                          placeholder="Recipient Full Name"
                        />
                      </label>

                      <label className="auth-label">
                        <span>Phone Number <span className="required-star">*</span></span>
                        <input
                          type="tel"
                          required
                          value={addrForm.phone}
                          onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                          className="auth-input"
                          placeholder="10-digit Phone Number"
                        />
                      </label>
                    </div>

                    <div className="form-row-2">
                      <label className="auth-label">
                        <span>Address Type / Tag</span>
                        <select
                          value={addrForm.tag}
                          onChange={(e) => setAddrForm({ ...addrForm, tag: e.target.value })}
                          className="auth-input"
                        >
                          <option value="Home">Home</option>
                          <option value="Work">Work / Office</option>
                          <option value="Other">Other</option>
                        </select>
                      </label>

                      <label className="auth-label">
                        <span>Country <span className="required-star">*</span></span>
                        <input
                          type="text"
                          required
                          value={addrForm.country}
                          onChange={(e) => setAddrForm({ ...addrForm, country: e.target.value })}
                          className="auth-input"
                        />
                      </label>
                    </div>

                    <label className="auth-label">
                      <span>Street Address Line 1 <span className="required-star">*</span></span>
                      <input
                        type="text"
                        required
                        value={addrForm.line1}
                        onChange={(e) => setAddrForm({ ...addrForm, line1: e.target.value })}
                        className="auth-input"
                        placeholder="House / Flat No., Building, Street"
                      />
                    </label>

                    <label className="auth-label">
                      <span>Address Line 2 (Optional)</span>
                      <input
                        type="text"
                        value={addrForm.line2}
                        onChange={(e) => setAddrForm({ ...addrForm, line2: e.target.value })}
                        className="auth-input"
                        placeholder="Apartment, suite, landmark"
                      />
                    </label>

                    <div className="form-row-3">
                      <label className="auth-label">
                        <span>City <span className="required-star">*</span></span>
                        <input
                          type="text"
                          required
                          value={addrForm.city}
                          onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                          className="auth-input"
                          placeholder="City"
                        />
                      </label>

                      <label className="auth-label">
                        <span>State</span>
                        <input
                          type="text"
                          value={addrForm.state}
                          onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                          className="auth-input"
                          placeholder="State"
                        />
                      </label>

                      <label className="auth-label">
                        <span>Postal Code (PIN) <span className="required-star">*</span></span>
                        <input
                          type="text"
                          required
                          value={addrForm.postalCode}
                          onChange={(e) => setAddrForm({ ...addrForm, postalCode: e.target.value })}
                          className="auth-input"
                          placeholder="e.g. 110001"
                        />
                      </label>
                    </div>

                    <label className="address-checkbox-label">
                      <input
                        type="checkbox"
                        checked={addrForm.isDefault}
                        onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                      />
                      <span>Make this my default shipping address</span>
                    </label>

                    <div className="form-action-row">
                      <button
                        type="submit"
                        className="app-button"
                        disabled={savingAddress}
                      >
                        {savingAddress ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                            <Loader2 size={16} className="spin-animate" /> Saving to Database...
                          </span>
                        ) : (
                          "Save Address"
                        )}
                      </button>
                      <button
                        type="button"
                        className="address-cancel-btn"
                        onClick={() => setShowAddAddress(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Addresses List */}
              {loadingAddresses ? (
                <div className="account-loading-box">
                  <Loader2 size={28} className="spin-animate" />
                  <span>Loading saved addresses from database...</span>
                </div>
              ) : addresses.length === 0 && !showAddAddress ? (
                <div className="account-empty-card" style={{ marginTop: "24px" }}>
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
                      onClick={() => setShowAddAddress(true)}
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
                        <span className="address-tag-pill">{addr.tag || "Home"}</span>
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
                        {addr.city}, {addr.state ? `${addr.state} - ` : ""}{addr.postalCode}
                        <br />
                        {addr.country || "India"}
                      </div>
                      <div className="address-phone">Phone: {addr.phone}</div>

                      <div className="address-card-actions">
                        <button
                          type="button"
                          className="address-delete-btn"
                          onClick={() => handleDeleteAddress(addr._id)}
                          title="Delete address"
                        >
                          <Trash2 size={15} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
    </div>
  );
}
