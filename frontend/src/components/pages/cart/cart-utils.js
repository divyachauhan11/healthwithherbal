/**
 * Pure helpers shared by the cart drawer (and the checkout totals).
 */

/** Indian states offered by the drawer's shipping estimator. */
export const ALL_INDIAN_STATES = [
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

/** Destination countries offered by the drawer's shipping estimator. */
export const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "United Arab Emirates",
  "Singapore",
  "Germany",
];

/** Delay (ms) before the drawer pushes cart changes to the backend. */
export const CART_SYNC_DELAY_MS = 600;

/**
 * Format an amount in the drawer's rupee style, e.g. `Rs. 1,139.00`.
 * @param {number|string} val
 * @returns {string}
 */
export const formatPrice = (val) => {
  const num = Number(val || 0);
  return `Rs. ${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * MRP shown by the drawer: the product's `original` price, or the selling
 * price plus 25% when none is set.
 * @param {object} product
 * @returns {number}
 */
export const cartListPrice = (product) =>
  Number(product.original || product.price * 1.25);

/**
 * Size label shown under a line item (weight, or a category fallback).
 * @param {object} product
 * @returns {string}
 */
export const cartWeightLabel = (product) =>
  product.weightG
    ? `${product.weightG}g`
    : product.category === "Skin Care"
      ? "50ml"
      : product.category === "Joint Care"
        ? "60 capsules"
        : "100g";

/**
 * Group the cart's product IDs (one entry per unit) into priced line items.
 * Products are matched by `id`, `legacyId` or `_id`; unknown IDs are skipped.
 * @param {Array<string|number>} cart
 * @param {object[]} products
 * @returns {{product: object, quantity: number, originalPrice: number, sellingPrice: number, totalOriginal: number, totalSelling: number, weight: string}[]}
 */
export function buildCartLineItems(cart, products) {
  return Array.from(new Set(cart))
    .map((id) => {
      const prod = products.find(
        (p) => p.id === id || p.legacyId === id || p._id === id,
      );
      if (!prod) return null;
      const quantity = cart.filter((item) => item === id).length;
      const originalPrice = cartListPrice(prod);
      const sellingPrice = Number(prod.price);

      return {
        product: prod,
        quantity,
        originalPrice,
        sellingPrice,
        totalOriginal: originalPrice * quantity,
        totalSelling: sellingPrice * quantity,
        weight: cartWeightLabel(prod),
      };
    })
    .filter(Boolean);
}

/**
 * Sum one numeric field across line items.
 * @param {object[]} lineItems
 * @param {"totalOriginal"|"totalSelling"} field
 * @returns {number}
 */
export const sumLineItems = (lineItems, field) =>
  lineItems.reduce((sum, item) => sum + item[field], 0);

/**
 * Items payload for the background cart sync.
 * @param {object[]} lineItems Drawer line items.
 * @returns {{productId: string|number, quantity: number}[]}
 */
export const toCartSyncItems = (lineItems) =>
  lineItems.map((li) => ({
    productId: li.product.legacyId || li.product.id,
    quantity: li.quantity,
  }));

/**
 * Discount a coupon gives on a subtotal: nothing below its minimum order
 * amount, a percentage or a fixed amount (never more than the subtotal).
 * Free-shipping coupons discount nothing here.
 * @param {object|null} coupon Validated coupon.
 * @param {number} subtotal Subtotal at selling prices.
 * @param {{capped?: boolean}} [options] `capped` applies the coupon's
 *   `maxDiscountAmount` to percentage discounts.
 * @returns {number}
 */
export function couponDiscountFor(coupon, subtotal, { capped = false } = {}) {
  if (!coupon) return 0;
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return 0;
  }
  if (coupon.discountType === "percent") {
    const pct = (subtotal * coupon.discountValue) / 100;
    return capped && coupon.maxDiscountAmount
      ? Math.min(pct, coupon.maxDiscountAmount)
      : pct;
  }
  if (coupon.discountType === "fixed") {
    return Math.min(coupon.discountValue, subtotal);
  }
  return 0;
}

/**
 * Shipping charge for the chosen option; free with a free-shipping coupon.
 * @param {{price?: number|string}} shippingOption
 * @param {object|null} coupon
 * @returns {number}
 */
export const shippingCostFor = (shippingOption, coupon) =>
  coupon?.discountType === "free_shipping"
    ? 0
    : Math.max(0, Number(shippingOption.price) || 0);

/**
 * Default shipping option for a destination country (a new object per call).
 * @param {string} country
 * @returns {{method: string, name: string, price: number, estimatedDays: string}}
 */
export const defaultShippingOptionFor = (country) =>
  country === "India"
    ? { method: "standard", name: "Standard Shipping", price: 0, estimatedDays: "3-5 business days" }
    : { method: "international_express", name: "International Express", price: 450, estimatedDays: "7-10 business days" };

/**
 * Shipping method key for an estimated rate.
 * @param {{name: string}} rate
 * @param {string} country Destination country.
 * @returns {"international_express"|"express"|"standard"}
 */
export const shippingMethodForRate = (rate, country) =>
  country !== "India"
    ? "international_express"
    : rate.name.toLowerCase().includes("express") ? "express" : "standard";

/**
 * Shipping option to select for an estimated rate.
 * @param {{name: string, price: number|string, estimatedDays?: string}} rate
 * @param {string} method Result of {@link shippingMethodForRate}.
 * @returns {{method: string, name: string, price: number, estimatedDays: string}}
 */
export const shippingOptionFromRate = (rate, method) => ({
  method,
  name: rate.name,
  price: Number(rate.price) || 0,
  estimatedDays: rate.estimatedDays || "",
});

/**
 * Estimated delivery window, 3 to 5 days from now, as "21 November" labels.
 * @returns {{start: string, end: string}}
 */
export function estimateDeliveryWindow() {
  const today = new Date();
  const d1 = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
  const d2 = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);
  const opts = { day: "numeric", month: "long" };
  return {
    start: d1.toLocaleDateString("en-IN", opts),
    end: d2.toLocaleDateString("en-IN", opts),
  };
}

/**
 * Up to five products to recommend: those not in the cart, or the whole
 * catalogue when fewer than four remain.
 * @param {object[]} products
 * @param {Array<string|number>} cart
 * @returns {object[]}
 */
export function pickRecommendedProducts(products, cart) {
  const inCartIds = new Set(cart);
  const available = products.filter(
    (p) => !inCartIds.has(p.id) && !inCartIds.has(p.legacyId),
  );
  return (available.length >= 4 ? available : products).slice(0, 5);
}

/**
 * Normalize backend coupons into the drawer's offer chips.
 * @param {object[]|null|undefined} coupons
 * @returns {{code: string, discountType: string, discountValue: number, minOrderAmount: number, description: string}[]}
 */
export const toCouponOffers = (coupons) =>
  (coupons || []).map((c) => ({
    code: c.code,
    discountType: c.discountType || "percent",
    discountValue: Number(c.discountValue) || 0,
    minOrderAmount: Number(c.minOrderAmount) || 0,
    description: c.description || "",
  }));

/**
 * Coupon value as an "... OFF" label, e.g. `10% OFF` or `Rs. 150 OFF`.
 * @param {{discountType: string, discountValue: number}} coupon
 * @param {string} freeShippingLabel Label used for free-shipping coupons.
 * @returns {string}
 */
export const couponOffLabel = (coupon, freeShippingLabel) =>
  coupon.discountType === "percent"
    ? `${coupon.discountValue}% OFF`
    : coupon.discountType === "free_shipping"
      ? freeShippingLabel
      : `Rs. ${coupon.discountValue} OFF`;

/**
 * What a coupon saves, for the "applied" message, e.g. `10%` or `Rs. 150`.
 * @param {{discountType: string, discountValue: number}} coupon
 * @returns {string}
 */
export const couponSavingsLabel = (coupon) =>
  coupon.discountType === "percent"
    ? `${coupon.discountValue}%`
    : coupon.discountType === "free_shipping"
      ? "Free Shipping"
      : `Rs. ${coupon.discountValue}`;

/**
 * One-line postal address (line1, line2, city, state, PIN, country).
 * @param {object} address Saved address.
 * @returns {string}
 */
export const formatAddressOneLine = (address) =>
  [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ].filter(Boolean).join(", ");
