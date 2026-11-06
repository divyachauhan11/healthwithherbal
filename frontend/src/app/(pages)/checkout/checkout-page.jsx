"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ShieldCheck,
  Tag,
  X,
  CheckCircle2,
  MapPin,
  Loader2,
  RefreshCw,
  Plus,
  Banknote,
  Leaf,
  Truck,
  Lock,
} from "lucide-react";
import { AppButton } from "../../../components/global/primitives";
import {
  createOrder,
  validateCoupon,
  fetchUserAddresses,
} from "../../../lib/api";

export function CheckoutPage({
  cart,
  total,
  onComplete,
  products = [],
  coupons = [],
  currentUser = null,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // Saved addresses state from database
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [usingCustomAddress, setUsingCustomAddress] = useState(false);

  // Controlled form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
    country: "India",
  });

  const activeProducts = products;

  const lineItems = useMemo(() => {
    return Array.from(new Set(cart))
      .map((id) => {
        const prod = activeProducts.find((item) => item.id === id);
        if (!prod) return null;
        return {
          product: prod,
          quantity: cart.filter((item) => item === id).length,
        };
      })
      .filter(Boolean);
  }, [cart, activeProducts]);

  const rawSubtotal = useMemo(
    () =>
      lineItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      ),
    [lineItems],
  );

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (
      appliedCoupon.minOrderAmount &&
      rawSubtotal < appliedCoupon.minOrderAmount
    ) {
      return 0;
    }
    if (appliedCoupon.discountType === "percent") {
      const pct = (rawSubtotal * appliedCoupon.discountValue) / 100;
      return appliedCoupon.maxDiscountAmount
        ? Math.min(pct, appliedCoupon.maxDiscountAmount)
        : pct;
    }
    if (appliedCoupon.discountType === "fixed") {
      return Math.min(appliedCoupon.discountValue, rawSubtotal);
    }
    return 0;
  }, [appliedCoupon, rawSubtotal]);

  const isFreeShipping =
    appliedCoupon?.discountType === "free_shipping" || rawSubtotal >= 75;
  const shippingFee = rawSubtotal === 0 || isFreeShipping ? 0 : 8;
  const finalTotal = Math.max(0, rawSubtotal - discountAmount + shippingFee);

  // Helper to map address fields to form state
  const applyAddressToForm = (addr) => {
    if (!addr) return;
    const nameParts = (addr.fullName || currentUser?.name || "")
      .trim()
      .split(" ");
    const streetCombined = addr.line2
      ? `${addr.line1}, ${addr.line2}`
      : addr.line1;

    setFormData({
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      email: currentUser?.email || addr.userEmail || "",
      phone: addr.phone || currentUser?.phone || "",
      street: streetCombined || "",
      city: addr.city || "",
      postalCode: addr.postalCode || "",
      country: addr.country || "India",
    });
  };

  // Fetch saved addresses from database on mount or when currentUser changes
  useEffect(() => {
    if (!currentUser) return;

    let active = true;
    setLoadingAddresses(true);

    fetchUserAddresses({
      phone: currentUser.phone || "",
      email: currentUser.email || "",
      userId: currentUser._id || "",
    })
      .then((addrs) => {
        if (!active) return;
        const list = Array.isArray(addrs) ? addrs : [];
        setSavedAddresses(list);

        if (list.length > 0) {
          // Identify default address (isDefault = true, or first address)
          const def = list.find((a) => a.isDefault) || list[0];
          setSelectedAddressId(def._id);
          applyAddressToForm(def);
        } else {
          // No saved addresses yet: pre-fill user's name & email
          const nameParts = (currentUser.name || "").trim().split(" ");
          setFormData((prev) => ({
            ...prev,
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(" ") || "",
            email: currentUser.email || "",
            phone: currentUser.phone || "",
          }));
        }
      })
      .catch((err) => {
        console.error("Failed to load saved addresses for checkout:", err);
      })
      .finally(() => {
        if (active) setLoadingAddresses(false);
      });

    return () => {
      active = false;
    };
  }, [currentUser]);

  // Handle switching to a specific saved address
  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setUsingCustomAddress(false);
    applyAddressToForm(addr);
  };

  // Reset to enter a fresh address
  const handleUseNewAddress = () => {
    setUsingCustomAddress(true);
    setSelectedAddressId(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
      street: "",
      city: "",
      postalCode: "",
      country: "India",
    });
  };

  const handleApplyCoupon = async (codeToTry) => {
    const code = (codeToTry || couponCodeInput).trim().toUpperCase();
    if (!code) return;
    setCouponError("");
    setCouponSuccess("");

    try {
      const coupon = await validateCoupon(code);
      if (coupon.minOrderAmount && rawSubtotal < coupon.minOrderAmount) {
        setCouponError(
          `This coupon requires a minimum order of ₹${coupon.minOrderAmount}`,
        );
        return;
      }
      setAppliedCoupon(coupon);
      setCouponSuccess(`Coupon ${coupon.code} applied!`);
      setCouponCodeInput("");
    } catch (err) {
      setCouponError(err.message || "Invalid or expired coupon code.");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess("");
    setCouponError("");
  };

  const activeAddress =
    savedAddresses.find((a) => a._id === selectedAddressId) ||
    savedAddresses[0];

  return (
    <main className="checkout-page page-width">
      <div className="checkout-form">
        <span className="eyebrow">
          <ShieldCheck size={14} />
          Secure checkout
        </span>
        <h1>Delivery details</h1>
        <p className="checkout-subtitle">
          Confirm your delivery address and payment method to complete your herbal order.
        </p>

        {/* ================================================================= */}
        {/* DEFAULT ADDRESS DISPLAY SECTION                                    */}
        {/* ================================================================= */}
        {loadingAddresses && (
          <div className="checkout-address-loading">
            <Loader2 size={16} className="spin-animate" />
            <span>Loading default address from database...</span>
          </div>
        )}

        {!loadingAddresses &&
          savedAddresses.length > 0 &&
          activeAddress &&
          !usingCustomAddress && (
            <div className="checkout-default-address-card">
              <div className="default-address-card-header">
                <div className="default-address-badge">
                  <CheckCircle2 size={15} />
                  <span>
                    {activeAddress.isDefault
                      ? "Default Delivery Address"
                      : "Selected Delivery Address"}
                  </span>
                </div>
                <span className="address-tag-pill">
                  {activeAddress.tag || "Home"}
                </span>
              </div>

              <div className="default-address-body">
                <div className="default-address-recipient">
                  {activeAddress.fullName}
                </div>
                <div className="default-address-text">
                  <MapPin
                    size={16}
                    style={{
                      color: "var(--forest)",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  />
                  <span>
                    {activeAddress.line1}
                    {activeAddress.line2 ? `, ${activeAddress.line2}` : ""},{" "}
                    {activeAddress.city}
                    {activeAddress.state ? `, ${activeAddress.state}` : ""} -{" "}
                    {activeAddress.postalCode}, {activeAddress.country || "India"}
                  </span>
                </div>
                {activeAddress.phone && (
                  <div className="default-address-phone">
                    <span>Phone:</span> {activeAddress.phone}
                  </div>
                )}
              </div>

              {/* Switch between saved addresses if user has multiple */}
              {savedAddresses.length > 1 && (
                <div className="checkout-saved-address-switcher">
                  <span className="switcher-title">
                    Or deliver to another saved address:
                  </span>
                  <div className="switcher-chips">
                    {savedAddresses.map((addr) => (
                      <button
                        type="button"
                        key={addr._id}
                        className={`address-chip-btn ${selectedAddressId === addr._id ? "selected" : ""}`}
                        onClick={() => handleSelectAddress(addr)}
                      >
                        {addr.tag || "Address"} {addr.isDefault ? "★" : ""} (
                        {addr.city})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="default-address-footer">
                <span className="auto-filled-note">
                  ✓ Auto-filled in delivery details below
                </span>
                <button
                  type="button"
                  className="toggle-address-action-btn"
                  onClick={handleUseNewAddress}
                >
                  + Enter a new address
                </button>
              </div>
            </div>
          )}

        {usingCustomAddress && savedAddresses.length > 0 && (
          <div className="checkout-address-notice-box">
            <span style={{ fontSize: "13px", color: "var(--muted)" }}>
              Entering a custom delivery address.
            </span>
            <button
              type="button"
              className="toggle-address-action-btn"
              onClick={() => {
                const def =
                  savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
                handleSelectAddress(def);
              }}
            >
              ← Use Default Address
            </button>
          </div>
        )}

        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setSubmitting(true);
            setError("");

            try {
              const order = await createOrder({
                customer: {
                  firstName: formData.firstName.trim(),
                  lastName: formData.lastName.trim(),
                  email: formData.email.trim(),
                  phone: formData.phone.trim(),
                  street: formData.street.trim(),
                  city: formData.city.trim(),
                  postalCode: formData.postalCode.trim(),
                  country: formData.country.trim(),
                },
                phone: formData.phone.trim(),
                userId: currentUser?._id || null,
                items: lineItems.map(({ product, quantity }) => ({
                  productId: product.id,
                  quantity,
                })),
                couponCode: appliedCoupon?.code,
              });
              onComplete(order);
            } catch (requestError) {
              setError(
                requestError instanceof Error
                  ? requestError.message
                  : "Could not place your order.",
              );
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div className="form-grid">
            <label>
              First name *
              <input
                name="firstName"
                placeholder="First name"
                autoComplete="given-name"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </label>
            <label>
              Last name *
              <input
                name="lastName"
                placeholder="Last name"
                autoComplete="family-name"
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </label>
          </div>

          <div className="form-grid">
            <label>
              Email address *
              <input
                name="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </label>
            <label>
              Phone number *
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </label>
          </div>

          <div className="form-group-full">
            <label>
              Street address *
              <input
                name="street"
                placeholder="House / Flat / Street address"
                autoComplete="street-address"
                required
                value={formData.street}
                onChange={(e) =>
                  setFormData({ ...formData, street: e.target.value })
                }
              />
            </label>
          </div>

          <div className="form-grid">
            <label>
              City *
              <input
                name="city"
                placeholder="City"
                autoComplete="address-level2"
                required
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </label>
            <label>
              Postal code *
              <input
                name="postalCode"
                placeholder="6-digit PIN code"
                autoComplete="postal-code"
                required
                value={formData.postalCode}
                onChange={(e) =>
                  setFormData({ ...formData, postalCode: e.target.value })
                }
              />
            </label>
          </div>

          <div className="form-group-full">
            <label>
              Country *
              <select
                name="country"
                autoComplete="country-name"
                required
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
              >
                <option value="">Select a country</option>
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>
            </label>
          </div>

          <h3 className="checkout-section-title">
            <Banknote size={20} />
            Payment Method
          </h3>

          <div className="checkout-payment-box">
            <div className="checkout-payment-header">
              <div className="checkout-payment-option">
                <span className="payment-radio-indicator" />
                <span className="checkout-payment-title">
                  Cash on Delivery (COD)
                </span>
              </div>
              <span className="checkout-payment-badge">Available</span>
            </div>
            <p className="payment-note">
              Pay securely with cash or UPI QR at your doorstep when your order arrives. No advance payment required.
            </p>
          </div>

          {error && (
            <p role="alert" className="checkout-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="checkout-submit-btn"
            disabled={submitting || lineItems.length === 0}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="spin-animate" />
                Placing your order…
              </>
            ) : (
              <>
                <span>Place Order · ₹{finalTotal.toFixed(2)}</span>
                <ShieldCheck size={18} />
              </>
            )}
          </button>

          <div className="checkout-trust-guarantee">
            <div className="guarantee-item">
              <Leaf size={16} />
              <span>100% Herbal Purity</span>
            </div>
            <div className="guarantee-item">
              <Truck size={16} />
              <span>Safe Doorstep Delivery</span>
            </div>
            <div className="guarantee-item">
              <Lock size={16} />
              <span>Secure Checkout</span>
            </div>
          </div>
        </form>
      </div>

      <aside className="order-summary">
        <div className="order-summary-header">
          <h2>Order Summary</h2>
          <span className="order-summary-item-count">
            {lineItems.length} {lineItems.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="summary-items-list">
          {lineItems.map(({ product, quantity }) => (
            <div className="summary-item" key={product.id}>
              <img src={product.image} alt={product.title} />
              <div className="summary-item-details">
                <strong title={product.title}>{product.title}</strong>
                <small>
                  {product.brand} · Qty {quantity}
                </small>
              </div>
              <b>₹{(product.price * quantity).toFixed(2)}</b>
            </div>
          ))}
        </div>

        {/* Coupon Card */}
        <div className="checkout-coupon-card">
          <div className="checkout-coupon-title">
            <Tag size={16} color="var(--forest)" />
            <span>Have a Coupon Code?</span>
          </div>

          {appliedCoupon ? (
            <div className="checkout-applied-banner">
              <div>
                <span className="checkout-applied-code">
                  {appliedCoupon.code}
                </span>
                <span className="checkout-applied-desc">
                  {appliedCoupon.discountType === "percent"
                    ? `${appliedCoupon.discountValue}% OFF APPLIED`
                    : appliedCoupon.discountType === "fixed"
                      ? `₹${appliedCoupon.discountValue} OFF APPLIED`
                      : "FREE SHIPPING APPLIED"}
                </span>
              </div>
              <button
                type="button"
                className="checkout-coupon-remove-btn"
                onClick={handleRemoveCoupon}
                title="Remove coupon"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div>
              <div className="checkout-coupon-input-group">
                <input
                  type="text"
                  className="checkout-coupon-input"
                  placeholder="CODE (E.G. HERBAL15)"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyCoupon();
                    }
                  }}
                />
                <button
                  type="button"
                  className="checkout-coupon-apply-btn"
                  onClick={() => handleApplyCoupon()}
                >
                  Apply
                </button>
              </div>

              {coupons && coupons.length > 0 && (
                <div className="checkout-coupon-suggestions">
                  <span className="checkout-coupon-suggestions-label">
                    Available offers:
                  </span>
                  <div className="checkout-coupon-chips">
                    {coupons.map((c) => (
                      <button
                        key={c._id || c.code}
                        type="button"
                        className="checkout-coupon-chip"
                        onClick={() => handleApplyCoupon(c.code)}
                      >
                        {c.code}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {couponError && (
            <p className="checkout-coupon-msg error">{couponError}</p>
          )}
          {couponSuccess && (
            <p className="checkout-coupon-msg success">{couponSuccess}</p>
          )}
        </div>

        <div className="summary-lines">
          <div className="summary-line-row">
            <span>Subtotal</span>
            <b>₹{rawSubtotal.toFixed(2)}</b>
          </div>

          {discountAmount > 0 && (
            <div className="summary-line-row discount-row">
              <span>Discount ({appliedCoupon?.code})</span>
              <b>-₹{discountAmount.toFixed(2)}</b>
            </div>
          )}

          <div className="summary-line-row">
            <span>Shipping</span>
            <b>{shippingFee === 0 ? "FREE" : `₹${shippingFee.toFixed(2)}`}</b>
          </div>

          <div className="summary-line-row total-row">
            <span>Total</span>
            <b>₹{finalTotal.toFixed(2)}</b>
          </div>
        </div>

        <div className="checkout-secure-badge">
          <ShieldCheck size={16} color="var(--forest)" />
          <span>Guaranteed Authentic & Discreet Packaging</span>
        </div>
      </aside>
    </main>
  );
}
