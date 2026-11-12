"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ShieldCheck,
  Tag,
  Loader2,
  RefreshCw,
  Plus,
  Banknote,
  Leaf,
  Truck,
  Lock,
} from "lucide-react";
import { FormModal } from "../../../components/admin/global/FormModal";
import { LOGO_URL } from "../../../lib/store-data";
import {
  createOrder,
  validateCoupon,
  fetchUserAddresses,
  saveUserAddress,
  deleteUserAddress,
  updateUserAddress,
} from "../../../lib/api";

function SavedAddressCard({ address, selected, isDefault, onSelect, onEdit, onRemove }) {
  const hasNameInLine1 =
    address.line1 &&
    address.fullName &&
    address.line1.toLowerCase().startsWith(address.fullName.toLowerCase());

  const addressLine1 = hasNameInLine1
    ? [address.line1, address.line2].filter(Boolean).join(", ")
    : [address.fullName, address.line1, address.line2].filter(Boolean).join(", ");

  const stateZip = [address.state, address.postalCode].filter(Boolean).join(" - ");
  const addressLine2 = [address.city, stateZip].filter(Boolean).join(", ");

  return (
    <article
      className={`checkout-address-choice ${selected ? "selected" : ""} ${isDefault ? "is-default" : ""}`}
      onClick={onSelect}
    >
      <div className="checkout-address-choice-top">
        <label
          className="checkout-address-choice-select"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.();
          }}
        >
          <span className={`checkout-custom-radio ${selected ? "checked" : ""}`}>
            <input
              type="radio"
              name="deliveryAddress"
              checked={selected}
              onChange={onSelect}
              className="checkout-address-native-radio"
            />
            <span className="checkout-radio-circle">
              <span className="checkout-radio-dot" />
            </span>
          </span>
          <strong className="checkout-address-recipient">{address.fullName}</strong>
          <span className="checkout-address-choice-tag">{(address.tag || "HOME").toUpperCase()}</span>
        </label>
      </div>

      <div className="checkout-address-body">
        <div className="checkout-address-text">
          <div>{addressLine1}</div>
          {addressLine2 && <div>{addressLine2}</div>}
        </div>

        {address.phone && (
          <div className="checkout-address-phone-row">
            Mobile: <strong>{address.phone}</strong>
          </div>
        )}

        <div className="checkout-address-cod-row">
          <span className="checkout-cod-bullet">•</span> Pay on Delivery available
        </div>

        <div className="checkout-address-actions">
          <button
            type="button"
            className="checkout-address-btn checkout-address-btn-remove"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
          >
            REMOVE
          </button>
          <button
            type="button"
            className="checkout-address-btn checkout-address-btn-edit"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
          >
            EDIT
          </button>
        </div>
      </div>
    </article>
  );
}

function uniqueAddresses(addresses) {
  const normalize = (value) => String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
  const seen = new Set();

  return addresses.filter((address) => {
    // Default status and label are metadata; identical delivery details should
    // only create one selectable address card.
    const key = [
      address.fullName,
      address.phone,
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ].map(normalize).join("|");

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function CheckoutPage({
  cart,
  total,
  onComplete,
  products = [],
  coupons = [],
  currentUser = null,
  navigate,
  openContent,
}) {
  const [checkoutStep, setCheckoutStep] = useState("address");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const couponInputRef = useRef(null);

  // Saved addresses state from database
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");

  // Controlled form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });
  const [addressTag, setAddressTag] = useState("Home");

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

  const totalMrp = useMemo(
    () =>
      lineItems.reduce(
        (sum, item) =>
          sum + (Number(item.product.original) || Number(item.product.price) || 0) * item.quantity,
        0,
      ),
    [lineItems],
  );
  const mrpSavings = Math.max(0, totalMrp - rawSubtotal);

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
    setFormData({
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      email: currentUser?.email || addr.userEmail || "",
      phone: addr.phone || currentUser?.phone || "",
      street: addr.line1 || "",
      line2: addr.line2 || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.postalCode || "",
      country: addr.country || "India",
    });
    setAddressTag(addr.tag || "Home");
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
        const list = uniqueAddresses(Array.isArray(addrs) ? addrs : []);
        setSavedAddresses(list);

        if (list.length > 0) {
          // Identify default address (isDefault = true, or first address)
          const def = list.find((a) => a.isDefault) || list[0];
          setSelectedAddressId(def._id);
          applyAddressToForm(def);
        } else {
          setSelectedAddressId(null);
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
        if (active) setAddressError(err.message || "Could not load saved addresses.");
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
    setEditingAddressId(null);
    setIsAddressModalOpen(false);
    applyAddressToForm(addr);
  };

  const handleEditAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setEditingAddressId(addr._id);
    setAddressError("");
    setIsAddressModalOpen(true);
    applyAddressToForm(addr);
  };

  // Reset to enter a fresh address
  const handleUseNewAddress = () => {
    setIsAddressModalOpen(true);
    setEditingAddressId(null);
    setAddressError("");
    setAddressTag("Home");
    const nameParts = (currentUser?.name || "").trim().split(" ");
    setFormData({
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
      street: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    });
  };

  const handleCloseAddressModal = () => {
    const selectedAddress = savedAddresses.find((address) => address._id === selectedAddressId);
    if (selectedAddress) applyAddressToForm(selectedAddress);
    setEditingAddressId(null);
    setAddressError("");
    setIsAddressModalOpen(false);
  };

  const handleRemoveAddress = async (address) => {
    if (!window.confirm(`Remove the saved address for ${address.fullName}?`)) return;
    try {
      await deleteUserAddress(address._id);
      const remaining = savedAddresses.filter((item) => item._id !== address._id);
      setSavedAddresses(remaining);
      if (selectedAddressId === address._id) {
        const next = remaining.find((item) => item.isDefault) || remaining[0];
        if (next) handleSelectAddress(next);
        else setSelectedAddressId(null);
      }
    } catch (requestError) {
      setAddressError(requestError.message || "Could not remove saved address.");
    }
  };

  const currentEditingAddress = useMemo(
    () => savedAddresses.find((a) => a._id === editingAddressId) || null,
    [savedAddresses, editingAddressId],
  );

  const addressModalInitial = useMemo(() => {
    if (currentEditingAddress) {
      return {
        fullName: currentEditingAddress.fullName || "",
        phone: currentEditingAddress.phone || "",
        country: currentEditingAddress.country || "India",
        line1: currentEditingAddress.line1 || "",
        line2: currentEditingAddress.line2 || "",
        city: currentEditingAddress.city || "",
        state: currentEditingAddress.state || "",
        postalCode: currentEditingAddress.postalCode || "",
        tag: currentEditingAddress.tag || "Home",
        isDefault: Boolean(currentEditingAddress.isDefault),
      };
    }
    return {
      fullName: currentUser?.name || "",
      phone: currentUser?.phone || "",
      country: "India",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      tag: "Home",
      isDefault: savedAddresses.length === 0,
    };
  }, [currentEditingAddress, currentUser, savedAddresses.length]);

  const handleSaveAddress = async (values) => {
    const fullName = (values.fullName || `${values.firstName || ""} ${values.lastName || ""}`).trim();
    const line1 = (values.line1 || values.street || "").trim();
    const city = (values.city || "").trim();
    const postalCode = (values.postalCode || "").trim();

    if (!fullName || !line1 || !city || !postalCode) {
      setAddressError("Please complete the required delivery address fields.");
      return;
    }
    setSavingAddress(true);
    setAddressError("");
    const payload = {
      fullName,
      phone: (values.phone || currentUser?.phone || "").trim(),
      line1,
      line2: (values.line2 || "").trim(),
      city,
      state: (values.state || "").trim(),
      postalCode,
      country: values.country || "India",
      tag: values.tag || "Home",
      isDefault: Boolean(values.isDefault),
      userPhone: currentUser?.phone || values.phone || "",
      userEmail: currentUser?.email || values.email || "",
      userId: currentUser?._id || null,
    };
    try {
      const address = editingAddressId
        ? await updateUserAddress(editingAddressId, payload)
        : await saveUserAddress({
            ...payload,
            isDefault: values.isDefault ?? (savedAddresses.length === 0),
          });
      setSavedAddresses((current) => uniqueAddresses(
        editingAddressId
          ? current.map((item) => (item._id === address._id ? address : item))
          : [address, ...current],
      ));
      setIsAddressModalOpen(false);
      setEditingAddressId(null);
      handleSelectAddress(address);
    } catch (requestError) {
      setAddressError(requestError.message || "Could not save address.");
    } finally {
      setSavingAddress(false);
    }
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

  const continueToPayment = () => {
    if (!selectedAddressId || !formData.street.trim() || !formData.city.trim() || !formData.postalCode.trim()) {
      setError("Select or add a delivery address to continue.");
      return;
    }
    setError("");
    setCheckoutStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const defaultAddress =
    savedAddresses.find((address) => address.isDefault) || savedAddresses[0];
  const otherAddresses = savedAddresses.filter(
    (address) => address._id !== defaultAddress?._id,
  );

  return (
    <div className="checkout-flow-page">
      <header className="checkout-flow-header">
        <button
          type="button"
          className="checkout-flow-logo"
          onClick={() => navigate?.("home")}
          aria-label="Health With Herbal home"
        >
          <img src={LOGO_URL} alt="Health With Herbal" />
        </button>
        <nav className="checkout-flow-steps" aria-label="Checkout progress">
          <span className="checkout-flow-step complete">Bag</span>
          <span className="checkout-flow-connector" aria-hidden="true" />
          <span className={`checkout-flow-step ${checkoutStep === "address" ? "current" : "complete"}`} aria-current={checkoutStep === "address" ? "step" : undefined}>Address</span>
          <span className="checkout-flow-connector" aria-hidden="true" />
          <span className={`checkout-flow-step ${checkoutStep === "payment" ? "current" : ""}`} aria-current={checkoutStep === "payment" ? "step" : undefined}>Payment</span>
        </nav>
        <span className="checkout-flow-security">
          <ShieldCheck size={20} />
          <span>100% Secure</span>
        </span>
      </header>

      <main className="checkout-page page-width">
      <div className="checkout-form">
        <span className="eyebrow">
          <ShieldCheck size={14} />
          Secure checkout
        </span>
        <h1>{checkoutStep === "address" ? "Delivery details" : "Payment method"}</h1>
        <p className="checkout-subtitle">
          {checkoutStep === "address"
            ? "Confirm your delivery address to continue with your herbal order."
            : "Choose how you would like to pay for your herbal order."}
        </p>

        {checkoutStep === "address" && <>
        <section className="checkout-address-section" aria-labelledby="delivery-address-title">
          <div className="checkout-address-section-header">
            <h2 id="delivery-address-title">Select Delivery Address</h2>
            <button type="button" onClick={handleUseNewAddress}>Add New Address</button>
          </div>

          {loadingAddresses && (
            <div className="checkout-address-loading">
              <Loader2 size={16} className="spin-animate" />
              <span>Loading saved addresses…</span>
            </div>
          )}

          {!loadingAddresses && defaultAddress && (
            <>
              <h3 className="checkout-address-group-title">Default Address</h3>
              <SavedAddressCard
                address={defaultAddress}
                selected={selectedAddressId === defaultAddress._id}
                isDefault
                onSelect={() => handleSelectAddress(defaultAddress)}
                onEdit={() => handleEditAddress(defaultAddress)}
                onRemove={() => handleRemoveAddress(defaultAddress)}
              />

              {otherAddresses.length > 0 && (
                <>
                  <h3 className="checkout-address-group-title">Other Addresses</h3>
                  <div className="checkout-address-list">
                    {otherAddresses.map((address) => (
                      <SavedAddressCard
                        key={address._id}
                        address={address}
                        selected={selectedAddressId === address._id}
                        onSelect={() => handleSelectAddress(address)}
                        onEdit={() => handleEditAddress(address)}
                        onRemove={() => handleRemoveAddress(address)}
                      />
                    ))}
                  </div>
                </>
              )}

              <button type="button" className="checkout-add-address-card" onClick={handleUseNewAddress}>
                + Add New Address
              </button>
            </>
          )}

          {!loadingAddresses && !defaultAddress && (
            <p className="checkout-no-addresses">Add a delivery address to continue.</p>
          )}

          {addressError && (
            <p role="alert" className="checkout-error">{addressError}</p>
          )}
        </section>

        </>}

        <form
          id="checkout-details-form"
          onSubmit={async (event) => {
            event.preventDefault();
            if (checkoutStep !== "payment") return;
            if (paymentMethod === "payu") {
              setError("PayU online payments are not configured yet. Please choose Cash on Delivery.");
              return;
            }
            if (!selectedAddressId || !formData.street.trim() || !formData.city.trim() || !formData.postalCode.trim()) {
              setError("Select or add a delivery address to continue.");
              return;
            }
            setSubmitting(true);
            setError("");

            try {
              const order = await createOrder({
                customer: {
                  firstName: formData.firstName.trim(),
                  lastName: formData.lastName.trim(),
                  email: formData.email.trim(),
                  phone: formData.phone.trim(),
                  street: [formData.street, formData.line2].filter(Boolean).join(", ").trim(),
                  city: formData.city.trim(),
                  state: formData.state.trim(),
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
          {checkoutStep === "payment" && <>
          <button type="button" className="checkout-back-to-address" onClick={() => setCheckoutStep("address")}>
            Back to address
          </button>
          <h3 className="checkout-section-title">
            <Banknote size={20} />
            Payment Method
          </h3>

          <button
            type="button"
            className={`checkout-payment-box ${paymentMethod === "cash_on_delivery" ? "selected" : ""}`}
            aria-pressed={paymentMethod === "cash_on_delivery"}
            onClick={() => { setPaymentMethod("cash_on_delivery"); setError(""); }}
          >
            <div className="checkout-payment-header">
              <div className="checkout-payment-option">
                <span className={`payment-radio-indicator ${paymentMethod === "cash_on_delivery" ? "checked" : ""}`} />
                <span className="checkout-payment-title">
                  Cash on Delivery (COD)
                </span>
              </div>
              <span className="checkout-payment-badge">Available</span>
            </div>
            <p className="payment-note">
              Pay securely with cash or UPI QR at your doorstep when your order arrives. No advance payment required.
            </p>
          </button>

          <button
            type="button"
            className={`checkout-payment-box checkout-payu-box ${paymentMethod === "payu" ? "selected" : ""}`}
            aria-pressed={paymentMethod === "payu"}
            onClick={() => { setPaymentMethod("payu"); setError(""); }}
          >
            <div className="checkout-payment-header">
              <div className="checkout-payment-option">
                <span className={`payment-radio-indicator ${paymentMethod === "payu" ? "checked" : ""}`} />
                <span className="checkout-payment-title">Online Payments</span>
                <span className="checkout-payu-wordmark" aria-label="PayU">PayU</span>
              </div>
              <span className="checkout-payment-badge checkout-payu-badge">Coming soon</span>
            </div>
            <p className="payment-note">
              Pay securely by credit or debit card, or internet banking through PayU.
            </p>
            <span className="checkout-payu-pay-now" aria-hidden="true">Pay Now</span>
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
          </>}
        </form>
      </div>

      <aside className="order-summary">
        <div className="order-summary-header">
          <h2>Order Summary</h2>
          <span className="order-summary-item-count">
            {cart.length} {cart.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="summary-items-list">
          {lineItems.map(({ product, quantity }) => {
            const unitPrice = Number(product.price) || 0;
            const originalPrice = Number(product.original) || 0;
            const discountPercent = originalPrice > unitPrice
              ? Math.round(((originalPrice - unitPrice) / originalPrice) * 100)
              : 0;
            const stockQty = Number(product.stockQty);

            return (
              <article className="summary-item" key={product.id}>
                <img src={product.image} alt={product.title} />
                <div className="summary-item-details">
                  <div className="summary-item-heading">
                    <strong title={product.title}>{product.title}</strong>
                    <b>₹{(unitPrice * quantity).toFixed(2)}</b>
                  </div>
                  <small className="summary-item-brand">
                    Sold by: {product.brand || "Health With Herbal"}
                  </small>
                  <div className="summary-item-meta">
                    {product.weightG > 0 && (
                      <span>{product.weightG} g</span>
                    )}
                    <span>Qty: {quantity}</span>
                    {product.stockQty != null && Number.isFinite(stockQty) && (
                      <span className={stockQty <= 0 ? "out-of-stock" : "stock-available"}>
                        {stockQty > 0 ? `${stockQty} left` : "Out of stock"}
                      </span>
                    )}
                  </div>
                  <div className="summary-item-pricing">
                    <strong>₹{unitPrice.toFixed(2)}</strong>
                    {originalPrice > unitPrice && (
                      <>
                        <del>₹{originalPrice.toFixed(2)}</del>
                        <span>{discountPercent}% OFF</span>
                      </>
                    )}
                    {quantity > 1 && <small>each</small>}
                  </div>
                </div>
              </article>
            );
          })}
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
                  ref={couponInputRef}
                  type="text"
                  className="checkout-coupon-input"
                  placeholder="Enter discount code"
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
          <h3 className="summary-lines-title">
            Price Details ({cart.length} {cart.length === 1 ? "Item" : "Items"})
          </h3>
          <div className="summary-line-row">
            <span>Total MRP</span>
            <b>₹{totalMrp.toFixed(2)}</b>
          </div>

          <div className="summary-line-row discount-row">
            <span>Discount on MRP</span>
            <b>-₹{mrpSavings.toFixed(2)}</b>
          </div>

          <div className="summary-line-row coupon-discount-row">
            <span>Coupon Discount</span>
            {appliedCoupon ? (
              <b>
                {discountAmount > 0
                  ? `-₹${discountAmount.toFixed(2)}`
                  : appliedCoupon.discountType === "free_shipping"
                    ? "Free shipping"
                    : "Applied"}
              </b>
            ) : (
              <button
                type="button"
                onClick={() => couponInputRef.current?.focus()}
              >
                Apply Coupon
              </button>
            )}
          </div>

          <div className="summary-line-row">
            <span>Shipping Fee</span>
            <b>{shippingFee === 0 ? "FREE" : `₹${shippingFee.toFixed(2)}`}</b>
          </div>

          <div className="summary-line-row total-row">
            <span>Total Amount</span>
            <b>₹{finalTotal.toFixed(2)}</b>
          </div>
        </div>

        {error && (
          <p role="alert" className="checkout-error">
            {error}
          </p>
        )}

        <p className="checkout-terms-note">
          By placing the order, you agree to our{" "}
          <button type="button" onClick={() => openContent?.("Terms & Conditions")}>
            Terms of Use
          </button>{" "}
          and{" "}
          <button type="button" onClick={() => openContent?.("Privacy Policy")}>
            Privacy Policy
          </button>.
        </p>

        <button
          type="button"
          className="checkout-submit-btn"
          disabled={submitting || lineItems.length === 0 || (checkoutStep === "address" && !selectedAddressId)}
          onClick={() => {
            if (checkoutStep === "address") {
              continueToPayment();
              return;
            }
            document.getElementById("checkout-details-form")?.requestSubmit();
          }}
        >
          {checkoutStep === "address" ? (
            <span>Continue to payment</span>
          ) : submitting ? (
            <>
              <Loader2 size={18} className="spin-animate" />
              Placing your order…
            </>
          ) : (
            <span>Place Order · ₹{finalTotal.toFixed(2)}</span>
          )}
        </button>

        <div className="checkout-secure-badge">
          <ShieldCheck size={16} color="var(--forest)" />
          <span>Guaranteed Authentic & Discreet Packaging</span>
        </div>
      </aside>
      </main>

      <FormModal
        entity="address"
        isOpen={isAddressModalOpen}
        initial={addressModalInitial}
        title={editingAddressId ? "Edit Address" : "Add New Address"}
        subtitle="Enter the details for your delivery address."
        className="checkout-address-form-modal address-modal-popup"
        onSave={handleSaveAddress}
        onClose={handleCloseAddressModal}
        busy={savingAddress}
        submitLabel={editingAddressId ? "Save Changes" : "Save Address"}
      >
        {addressError && <p role="alert" className="checkout-error wide">{addressError}</p>}
      </FormModal>
    </div>
  );
}
