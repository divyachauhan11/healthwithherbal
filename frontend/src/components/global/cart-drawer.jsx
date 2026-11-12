"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  X,
  Trash2,
  Plus,
  Minus,
  Share2,
  FileText,
  Clock,
  Tag,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  ArrowRight,
  Truck,
  Loader2,
} from "lucide-react";
import {
  listCoupons,
  validateCoupon,
  estimateShipping,
  syncCartWithBackend,
} from "../../lib/api";

// Helper to format currency in Indian Rupees format (e.g. Rs. 1,139.00)
const formatPrice = (val) => {
  const num = Number(val || 0);
  return `Rs. ${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const ALL_INDIAN_STATES = [
  "Jharkhand",
  "Tamil Nadu",
  "Maharashtra",
  "Karnataka",
  "Delhi",
  "Uttar Pradesh",
  "Gujarat",
  "Kerala",
  "West Bengal",
  "Punjab",
  "Haryana",
  "Rajasthan",
  "Madhya Pradesh",
  "Bihar",
  "Andhra Pradesh",
  "Telangana",
  "Assam",
  "Odisha",
  "Himachal Pradesh",
  "Uttarakhand",
  "Goa",
  "Jammu and Kashmir",
];

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "United Arab Emirates",
  "Singapore",
  "Germany",
];

export function CartDrawer({
  cart = [],
  close,
  remove,
  changeQuantity,
  checkout,
  products = [],
  coupons = [],
  onAdd,
  notify,
}) {
  const activeProducts = products;

  // Active sub-modal: null | "share" | "note" | "shipping" | "discount"
  const [activeModal, setActiveModal] = useState(null);

  // Order instructions note
  const [orderNote, setOrderNote] = useState("");
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);

  // Share cart
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Discount code management (validated live against MongoDB)
  const [discountInput, setDiscountInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountMsg, setDiscountMsg] = useState({ type: "", text: "" });
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [backendCoupons, setBackendCoupons] = useState(coupons);

  useEffect(() => {
    let active = true;
    listCoupons()
      .then((result) => {
        if (active && Array.isArray(result)) setBackendCoupons(result);
      })
      .catch((err) => {
        console.error("Failed to load available coupons:", err);
      });
    return () => {
      active = false;
    };
  }, []);

  // Shipping calculator (calculated live via backend API)
  const [shippingCountry, setShippingCountry] = useState("India");
  const [shippingProvince, setShippingProvince] = useState("Jharkhand");
  const [shippingZip, setShippingZip] = useState("345677");
  const [shippingFeedback, setShippingFeedback] = useState(null);
  const [calculatingShipping, setCalculatingShipping] = useState(false);

  // Breakdown accordion toggle
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Free shipping threshold (Rs. 999 default or from store settings)
  const FREE_SHIPPING_THRESHOLD = 999;

  // Real Database Coupons mapped from MongoDB backend
  const availableCoupons = useMemo(() => {
    return (backendCoupons || []).map((c) => ({
      code: c.code,
      discountType: c.discountType || "percent",
      discountValue: Number(c.discountValue) || 0,
      minOrderAmount: Number(c.minOrderAmount) || 0,
      description: c.description || "",
    }));
  }, [backendCoupons]);

  // Group line items using live database products
  const lineItems = useMemo(() => {
    return Array.from(new Set(cart))
      .map((id) => {
        const prod = activeProducts.find(
          (p) => p.id === id || p.legacyId === id || p._id === id,
        );
        if (!prod) return null;
        const quantity = cart.filter((item) => item === id).length;
        const originalPrice = Number(prod.original || prod.price * 1.25);
        const sellingPrice = Number(prod.price);
        const weightLabel = prod.weightG
          ? `${prod.weightG}g`
          : prod.category === "Skin Care"
            ? "50ml"
            : prod.category === "Joint Care"
              ? "60 capsules"
              : "100g";

        return {
          product: prod,
          quantity,
          originalPrice,
          sellingPrice,
          totalOriginal: originalPrice * quantity,
          totalSelling: sellingPrice * quantity,
          weight: weightLabel,
        };
      })
      .filter(Boolean);
  }, [cart, activeProducts]);

  // Totals calculations
  const totalItemCount = cart.length;

  const rawMrpTotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + item.totalOriginal, 0),
    [lineItems],
  );

  const rawSellingTotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + item.totalSelling, 0),
    [lineItems],
  );

  const itemSavings = Math.max(0, rawMrpTotal - rawSellingTotal);

  // Database coupon discount calculation
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (
      appliedCoupon.minOrderAmount &&
      rawSellingTotal < appliedCoupon.minOrderAmount
    ) {
      return 0;
    }
    if (appliedCoupon.discountType === "percent") {
      return (rawSellingTotal * appliedCoupon.discountValue) / 100;
    }
    if (appliedCoupon.discountType === "fixed") {
      return Math.min(appliedCoupon.discountValue, rawSellingTotal);
    }
    return 0;
  }, [appliedCoupon, rawSellingTotal]);

  const isFreeShipping =
    rawSellingTotal >= FREE_SHIPPING_THRESHOLD ||
    appliedCoupon?.discountType === "free_shipping";

  const shippingCost = isFreeShipping || rawSellingTotal === 0 ? 0 : 49;

  const toPay = Math.max(0, rawSellingTotal - couponDiscount + shippingCost);

  const totalSaved = itemSavings + couponDiscount;

  // Free shipping progress calculation
  const freeShippingProgress = Math.min(
    100,
    (rawSellingTotal / FREE_SHIPPING_THRESHOLD) * 100,
  );
  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - rawSellingTotal,
  );

  // Dynamic estimated delivery date
  const deliveryDates = useMemo(() => {
    const today = new Date();
    const d1 = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    const d2 = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);
    const opts = { day: "numeric", month: "long" };
    return {
      start: d1.toLocaleDateString("en-IN", opts),
      end: d2.toLocaleDateString("en-IN", opts),
    };
  }, []);

  // Recommended products: live products from MongoDB not currently in the cart
  const recommendedProducts = useMemo(() => {
    const inCartIds = new Set(cart);
    const available = activeProducts.filter(
      (p) => !inCartIds.has(p.id) && !inCartIds.has(p.legacyId),
    );
    return (available.length >= 4 ? available : activeProducts).slice(0, 5);
  }, [activeProducts, cart]);

  // Synchronize cart with backend database (session persistence)
  const syncTimeoutRef = useRef(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sessionId =
      localStorage.getItem("hwh_cart_session") ||
      `sess_${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem("hwh_cart_session", sessionId);

    // Debounced sync to avoid excessive calls
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      const itemsPayload = lineItems.map((li) => ({
        productId: li.product.legacyId || li.product.id,
        quantity: li.quantity,
      }));
      syncCartWithBackend({
        sessionId,
        items: itemsPayload,
        orderNote,
        couponCode: appliedCoupon?.code || "",
      }).catch((err) => {
        console.warn("Background cart sync failed:", err.message);
      });
    }, 600);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [cart, orderNote, appliedCoupon, lineItems]);

  // Handle adding recommended product
  const handleAddRecommended = (id) => {
    if (onAdd) {
      onAdd(id);
    } else if (changeQuantity) {
      changeQuantity(id, 1);
    }
    if (notify) {
      notify("Item added to cart!");
    }
  };

  // Handle Share cart copy
  const shareCartUrl = useMemo(() => {
    if (typeof window === "undefined") return "https://healthwithherbal.com";
    return `${window.location.origin}${window.location.pathname}?cart=${cart.join(",")}`;
  }, [cart]);

  const handleCopyShareLink = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(shareCartUrl);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2200);
    }
  };

  // Handle Order note save
  const handleSaveNote = () => {
    setNoteSavedFeedback(true);
    setTimeout(() => {
      setNoteSavedFeedback(false);
      setActiveModal(null);
    }, 900);
  };

  // Handle Live Shipping Calculation via Backend API
  const handleCalculateShipping = async () => {
    const cleanZip = (shippingZip || "").trim();
    if (!cleanZip) {
      setShippingFeedback({
        type: "error",
        text: `Please enter a postal PIN code for ${shippingProvince}, ${shippingCountry}`,
      });
      return;
    }

    setCalculatingShipping(true);
    setShippingFeedback(null);

    try {
      const result = await estimateShipping({
        country: shippingCountry,
        province: shippingProvince,
        postalCode: cleanZip,
        orderTotal: rawSellingTotal,
      });

      setShippingFeedback({
        type: "success",
        text:
          result.message || `Standard Shipping: Free for ${shippingProvince}!`,
      });
    } catch (err) {
      setShippingFeedback({
        type: "error",
        text:
          err.message ||
          `Enter a valid PIN code for ${shippingProvince}, ${shippingCountry}`,
      });
    } finally {
      setCalculatingShipping(false);
    }
  };

  // Handle Apply Coupon with Live Backend API Verification
  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || discountInput).trim().toUpperCase();
    if (!code) {
      setDiscountMsg({ type: "error", text: "Please enter a discount code" });
      return;
    }

    setValidatingCoupon(true);
    setDiscountMsg({ type: "", text: "" });

    try {
      // Validate live against MongoDB database backend
      const dbCoupon = await validateCoupon(code);

      if (
        dbCoupon.minOrderAmount &&
        rawSellingTotal < dbCoupon.minOrderAmount
      ) {
        setDiscountMsg({
          type: "error",
          text: `This coupon requires a minimum cart total of Rs. ${dbCoupon.minOrderAmount}`,
        });
        return;
      }

      setAppliedCoupon(dbCoupon);
      setDiscountInput(dbCoupon.code);
      setDiscountMsg({
        type: "success",
        text: `Coupon “${dbCoupon.code}” applied! You saved ${
          dbCoupon.discountType === "percent"
            ? `${dbCoupon.discountValue}%`
            : dbCoupon.discountType === "free_shipping"
              ? "Free Shipping"
              : `Rs. ${dbCoupon.discountValue}`
        }!`,
      });
    } catch (err) {
      setDiscountMsg({
        type: "error",
        text: err.message || `“${code}” is not a valid coupon code`,
      });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountInput("");
    setDiscountMsg({ type: "", text: "" });
  };

  return (
    <div className="cart-modal-backdrop" onClick={close}>
      <div
        className="cart-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Your Cart"
      >
        {/* Top Header */}
        <div className="cart-modal-header">
          <div className="cart-modal-title">
            <h2>Your cart</h2>
            <span className="cart-badge-count">{totalItemCount}</span>
          </div>
          <button
            type="button"
            className="cart-modal-close-btn"
            onClick={close}
            aria-label="Close cart modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping Strip */}
        <div className="cart-shipping-banner">
          <div className="cart-shipping-text">
            <Truck size={17} className="cart-shipping-icon" />
            <span>
              {isFreeShipping
                ? "Congratulations! You are eligible for free shipping!"
                : `Add ${formatPrice(remainingForFreeShipping)} more to qualify for FREE SHIPPING!`}
            </span>
          </div>
          <div className="cart-shipping-progress-track">
            <div
              className="cart-shipping-progress-fill"
              style={{
                width: `${isFreeShipping ? 100 : freeShippingProgress}%`,
              }}
            />
          </div>
        </div>

        {cart.length === 0 ? (
          /* Empty State */
          <div className="cart-empty-view">
            <div className="cart-empty-circle">
              <ShoppingBag size={40} />
            </div>
            <h3>Your cart is empty</h3>
            <p>Fill it with authentic herbal formulations and wellness care.</p>
            <button
              type="button"
              className="cart-primary-action-btn empty-btn"
              onClick={close}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          /* Two Column Grid */
          <div className="cart-modal-body">
            {/* Left Column: Cart Items + Actions + Summary + Checkout */}
            <div className="cart-left-column">
              {/* Items List */}
              <div className="cart-items-scroll">
                {lineItems.map(
                  ({
                    product,
                    quantity,
                    originalPrice,
                    sellingPrice,
                    weight,
                  }) => (
                    <div
                      className="cart-product-item"
                      key={product.id || product._id}
                    >
                      <img
                        src={product.image}
                        alt={product.title}
                        className="cart-product-thumb"
                      />

                      <div className="cart-product-middle">
                        <h4 className="cart-product-name">{product.title}</h4>
                        <p className="cart-product-delivery">
                          {weight}, Estimated delivery between{" "}
                          {deliveryDates.start} and {deliveryDates.end}. Order
                          within 29 minutes.
                        </p>

                        {/* Stepper */}
                        <div className="cart-qty-pill">
                          <button
                            type="button"
                            className="cart-qty-btn"
                            onClick={() => changeQuantity(product.id, -1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} strokeWidth={2.2} />
                          </button>
                          <span className="cart-qty-value">{quantity}</span>
                          <button
                            type="button"
                            className="cart-qty-btn"
                            onClick={() => changeQuantity(product.id, 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} strokeWidth={2.2} />
                          </button>
                        </div>
                      </div>

                      <div className="cart-product-right">
                        <button
                          type="button"
                          className="cart-trash-btn"
                          onClick={() => remove(product.id)}
                          aria-label="Remove item"
                        >
                          <Trash2 size={17} />
                        </button>
                        <div className="cart-product-prices">
                          {originalPrice > sellingPrice && (
                            <span className="cart-price-strike">
                              {formatPrice(originalPrice * quantity)}
                            </span>
                          )}
                          <span className="cart-price-selling">
                            {formatPrice(sellingPrice * quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>

              {/* Toolbar of 4 Action Buttons */}
              <div className="cart-toolbar-row">
                <button
                  type="button"
                  className="cart-toolbar-btn"
                  onClick={() => setActiveModal("share")}
                >
                  <Share2 size={15} />
                  <span>Share cart</span>
                </button>

                <button
                  type="button"
                  className={`cart-toolbar-btn ${orderNote ? "has-data" : ""}`}
                  onClick={() => setActiveModal("note")}
                >
                  <FileText size={15} />
                  <span>Order note{orderNote ? " ✓" : ""}</span>
                </button>

                <button
                  type="button"
                  className="cart-toolbar-btn"
                  onClick={() => setActiveModal("shipping")}
                >
                  <Clock size={15} />
                  <span>Shipping</span>
                </button>

                <button
                  type="button"
                  className={`cart-toolbar-btn ${appliedCoupon ? "has-data" : ""}`}
                  onClick={() => setActiveModal("discount")}
                >
                  <Tag size={15} />
                  <span>
                    Discount
                    <sup>({appliedCoupon ? 1 : 0})</sup>
                  </span>
                </button>
              </div>

              {/* Total & Savings Section */}
              <div className="cart-summary-section">
                <div className="cart-summary-main-row">
                  <div className="cart-summary-left-labels">
                    <span className="cart-total-label">Total</span>
                    {totalSaved > 0 && (
                      <span className="cart-savings-highlight">
                        You've saved {formatPrice(totalSaved)}!
                      </span>
                    )}
                  </div>

                  <div className="cart-summary-right-prices">
                    <button
                      type="button"
                      className="cart-total-toggle-btn"
                      onClick={() => setShowBreakdown((prev) => !prev)}
                      aria-label="Toggle price breakdown"
                    >
                      <strong className="cart-total-amount">
                        {formatPrice(toPay)}
                      </strong>
                      {showBreakdown ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                    {rawMrpTotal > toPay && (
                      <span className="cart-total-mrp-strike">
                        {formatPrice(rawMrpTotal)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expandable Breakdown Accordion */}
                {showBreakdown && (
                  <div className="cart-breakdown-panel">
                    <div className="cart-breakdown-row">
                      <span>Original MRP Total</span>
                      <span>{formatPrice(rawMrpTotal)}</span>
                    </div>
                    {itemSavings > 0 && (
                      <div className="cart-breakdown-row discount">
                        <span>Product Discounts</span>
                        <span>-{formatPrice(itemSavings)}</span>
                      </div>
                    )}
                    {appliedCoupon && (
                      <div className="cart-breakdown-row discount">
                        <span>Coupon ({appliedCoupon.code})</span>
                        <span>-{formatPrice(couponDiscount)}</span>
                      </div>
                    )}
                    <div className="cart-breakdown-row">
                      <span>Shipping</span>
                      <span>
                        {shippingCost === 0
                          ? "FREE"
                          : formatPrice(shippingCost)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Primary Checkout Button (Note: NO View Cart button as requested!) */}
                <button
                  type="button"
                  className="cart-primary-action-btn checkout-btn"
                  onClick={() => {
                    close();
                    checkout();
                  }}
                >
                  <span>Check out</span>
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>

            {/* Right Column: "You'll love this too" (Recommended Products from Database) */}
            <div className="cart-right-column">
              <h3 className="cart-rec-heading">You'll love this too</h3>

              <div className="cart-rec-list">
                {recommendedProducts.map((prod) => {
                  const orig = Number(prod.original || prod.price * 1.25);
                  const price = Number(prod.price);
                  return (
                    <div className="cart-rec-card" key={prod.id || prod._id}>
                      <img
                        src={prod.image}
                        alt={prod.title}
                        className="cart-rec-thumb"
                      />
                      <div className="cart-rec-info">
                        <h4 className="cart-rec-title" title={prod.title}>
                          {prod.title}
                        </h4>
                        <div className="cart-rec-pricing">
                          {orig > price && (
                            <span className="cart-rec-strike">
                              {formatPrice(orig)}
                            </span>
                          )}
                          <span className="cart-rec-price">
                            {formatPrice(price)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="cart-rec-add-btn"
                        onClick={() =>
                          handleAddRecommended(prod.id || prod.legacyId)
                        }
                        aria-label={`Add ${prod.title} to cart`}
                        title="Add to cart"
                      >
                        <Plus size={16} strokeWidth={2.6} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* SUB-MODAL 1: SHARE CART (Screenshot 2)                             */}
        {/* ------------------------------------------------------------------ */}
        {activeModal === "share" && (
          <div
            className="cart-submodal-overlay"
            onClick={() => setActiveModal(null)}
          >
            <div
              className="cart-submodal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cart-submodal-header">
                <h3>Share cart</h3>
                <button
                  type="button"
                  className="cart-submodal-close"
                  onClick={() => setActiveModal(null)}
                >
                  <X size={17} />
                </button>
              </div>

              <div className="cart-submodal-body">
                <label className="cart-submodal-label">Share link</label>
                <div className="cart-share-input-wrap">
                  <input
                    type="text"
                    readOnly
                    value={shareCartUrl}
                    className="cart-share-input"
                    onClick={(e) => e.target.select()}
                  />
                </div>

                <button
                  type="button"
                  className="cart-submodal-btn"
                  onClick={handleCopyShareLink}
                >
                  {copyFeedback ? "Copied! ✓" : "Copy link"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* SUB-MODAL 2: ORDER NOTE (Screenshot 3)                             */}
        {/* ------------------------------------------------------------------ */}
        {activeModal === "note" && (
          <div
            className="cart-submodal-overlay"
            onClick={() => setActiveModal(null)}
          >
            <div
              className="cart-submodal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cart-submodal-header">
                <h3>Order note</h3>
                <button
                  type="button"
                  className="cart-submodal-close"
                  onClick={() => setActiveModal(null)}
                >
                  <X size={17} />
                </button>
              </div>

              <div className="cart-submodal-body">
                <label className="cart-submodal-label">
                  Order special instructions
                </label>
                <textarea
                  className="cart-submodal-textarea"
                  placeholder="Order special instructions"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  rows={4}
                />

                <button
                  type="button"
                  className="cart-submodal-btn"
                  onClick={handleSaveNote}
                >
                  {noteSavedFeedback ? "Saved! ✓" : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* SUB-MODAL 3: ESTIMATE SHIPPING (Screenshot 4, Live Backend API)    */}
        {/* ------------------------------------------------------------------ */}
        {activeModal === "shipping" && (
          <div
            className="cart-submodal-overlay"
            onClick={() => setActiveModal(null)}
          >
            <div
              className="cart-submodal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cart-submodal-header">
                <h3>Estimate shipping</h3>
                <button
                  type="button"
                  className="cart-submodal-close"
                  onClick={() => setActiveModal(null)}
                >
                  <X size={17} />
                </button>
              </div>

              <div className="cart-submodal-body">
                <div className="cart-form-group">
                  <label className="cart-submodal-label">Country</label>
                  <select
                    className="cart-submodal-select"
                    value={shippingCountry}
                    onChange={(e) => setShippingCountry(e.target.value)}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {shippingCountry === "India" && (
                  <div className="cart-form-group">
                    <label className="cart-submodal-label">Province</label>
                    <select
                      className="cart-submodal-select"
                      value={shippingProvince}
                      onChange={(e) => setShippingProvince(e.target.value)}
                    >
                      {ALL_INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="cart-form-group">
                  <label className="cart-submodal-label">Zip/Postal Code</label>
                  <input
                    type="text"
                    className="cart-submodal-input"
                    value={shippingZip}
                    onChange={(e) => setShippingZip(e.target.value)}
                    placeholder="345677"
                  />
                </div>

                <button
                  type="button"
                  className="cart-submodal-btn"
                  onClick={handleCalculateShipping}
                  disabled={calculatingShipping}
                >
                  {calculatingShipping ? "Calculating..." : "Calculate"}
                </button>

                {shippingFeedback && (
                  <div
                    className={`cart-shipping-alert ${shippingFeedback.type}`}
                  >
                    {shippingFeedback.text}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* SUB-MODAL 4: DISCOUNT (Screenshot 5, Verified via Backend API)     */}
        {/* ------------------------------------------------------------------ */}
        {activeModal === "discount" && (
          <div
            className="cart-submodal-overlay"
            onClick={() => setActiveModal(null)}
          >
            <div
              className="cart-submodal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cart-submodal-header">
                <h3>Discount</h3>
                <button
                  type="button"
                  className="cart-submodal-close"
                  onClick={() => setActiveModal(null)}
                >
                  <X size={17} />
                </button>
              </div>

              <div className="cart-submodal-body">
                <div className="cart-discount-input-row">
                  <input
                    type="text"
                    className="cart-discount-input"
                    placeholder="Please enter discount code"
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleApplyCoupon();
                    }}
                  />
                  <button
                    type="button"
                    className="cart-discount-apply-btn"
                    onClick={() => handleApplyCoupon()}
                    disabled={validatingCoupon}
                  >
                    {validatingCoupon ? "Applying..." : "Apply"}
                  </button>
                </div>

                {discountMsg.text && (
                  <div className={`cart-discount-alert ${discountMsg.type}`}>
                    {discountMsg.text}
                  </div>
                )}

                {appliedCoupon && (
                  <div className="cart-applied-coupon-pill">
                    <span>
                      Active: <strong>{appliedCoupon.code}</strong> (
                      {appliedCoupon.discountType === "percent"
                        ? `${appliedCoupon.discountValue}% OFF`
                        : appliedCoupon.discountType === "free_shipping"
                          ? "FREE SHIPPING"
                          : `Rs. ${appliedCoupon.discountValue} OFF`}
                      )
                    </span>
                    <button
                      type="button"
                      className="cart-remove-coupon-btn"
                      onClick={handleRemoveCoupon}
                    >
                      Remove
                    </button>
                  </div>
                )}

                {availableCoupons.length > 0 && (
                  <div className="cart-available-offers-section">
                    <span className="cart-offers-heading">
                      Available Offers ({availableCoupons.length}):
                    </span>
                    <div className="cart-offers-chips-list">
                      {availableCoupons.map((c) => {
                        const isCurr = appliedCoupon?.code === c.code;
                        return (
                          <button
                            key={c.code}
                            type="button"
                            className={`cart-offer-chip ${isCurr ? "active" : ""}`}
                            onClick={() => handleApplyCoupon(c.code)}
                            title={c.description}
                          >
                            <Tag size={12} />
                            <strong>{c.code}</strong>
                            <small>
                              (
                              {c.discountType === "percent"
                                ? `${c.discountValue}% OFF`
                                : c.discountType === "free_shipping"
                                  ? "FREE SHIP"
                                  : `Rs. ${c.discountValue} OFF`}
                              )
                            </small>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
