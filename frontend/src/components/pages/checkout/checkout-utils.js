/**
 * Pure helpers for the checkout page: line items and totals, saved-address
 * mapping and the order payload.
 */

import { defaultShippingOptionFor } from "@/components/pages/cart/cart-utils";

/** DOM id of the checkout form that places the order. */
export const CHECKOUT_FORM_ID = "checkout-details-form";

/** Message shown when no complete delivery address is selected. */
export const MISSING_ADDRESS_MESSAGE = "Select or add a delivery address to continue.";

/**
 * Group the cart's product IDs (one entry per unit) into line items. Products
 * are matched by `id`; unknown IDs are skipped.
 * @param {Array<string|number>} cart
 * @param {object[]} products
 * @returns {{product: object, quantity: number}[]}
 */
export function buildCheckoutLineItems(cart, products) {
  return Array.from(new Set(cart))
    .map((id) => {
      const prod = products.find((item) => item.id === id);
      if (!prod) return null;
      return {
        product: prod,
        quantity: cart.filter((item) => item === id).length,
      };
    })
    .filter(Boolean);
}

/**
 * Subtotal at selling prices.
 * @param {{product: object, quantity: number}[]} lineItems
 * @returns {number}
 */
export const checkoutSubtotal = (lineItems) =>
  lineItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

/**
 * Total at MRP (`original`, falling back to the selling price).
 * @param {{product: object, quantity: number}[]} lineItems
 * @returns {number}
 */
export const checkoutMrpTotal = (lineItems) =>
  lineItems.reduce(
    (sum, item) =>
      sum +
      (Number(item.product.original) || Number(item.product.price) || 0) *
        item.quantity,
    0,
  );

/**
 * Rounded percentage saved against the MRP (0 when there is no saving).
 * @param {number} originalPrice
 * @param {number} unitPrice
 * @returns {number}
 */
export const discountPercentOff = (originalPrice, unitPrice) =>
  originalPrice > unitPrice
    ? Math.round(
        ((originalPrice - unitPrice) / originalPrice) * 100,
      )
    : 0;

/**
 * Label for an applied coupon, e.g. `10% OFF APPLIED`.
 * @param {{discountType: string, discountValue: number}} coupon
 * @returns {string}
 */
export const appliedCouponLabel = (coupon) =>
  coupon.discountType === "percent"
    ? `${coupon.discountValue}% OFF APPLIED`
    : coupon.discountType === "fixed"
      ? `₹${coupon.discountValue} OFF APPLIED`
      : "FREE SHIPPING APPLIED";

/**
 * Drop saved addresses with identical delivery details. Default status and
 * label are metadata, so they do not make an address distinct.
 * @param {object[]} addresses
 * @returns {object[]}
 */
export function uniqueAddresses(addresses) {
  const normalize = (value) =>
    String(value || "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  const seen = new Set();

  return addresses.filter((address) => {
    const key = [
      address.fullName,
      address.phone,
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ]
      .map(normalize)
      .join("|");

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Two display lines for a saved address card: recipient and street (the name
 * is skipped when the street already starts with it), then "City, State - PIN".
 * @param {object} address
 * @returns {{addressLine1: string, addressLine2: string}}
 */
export function savedAddressLines(address) {
  const hasNameInLine1 =
    address.line1 &&
    address.fullName &&
    address.line1.toLowerCase().startsWith(address.fullName.toLowerCase());

  const addressLine1 = hasNameInLine1
    ? [address.line1, address.line2].filter(Boolean).join(", ")
    : [address.fullName, address.line1, address.line2]
        .filter(Boolean)
        .join(", ");

  const stateZip = [address.state, address.postalCode]
    .filter(Boolean)
    .join(" - ");
  const addressLine2 = [address.city, stateZip].filter(Boolean).join(", ");

  return { addressLine1, addressLine2 };
}

/**
 * Split a full name into first name and the rest.
 * @param {string|undefined|null} name
 * @returns {{firstName: string, lastName: string}}
 */
export function splitFullName(name) {
  const nameParts = (name || "").trim().split(" ");
  return {
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" ") || "",
  };
}

/**
 * Checkout form values for a saved address, filling contact details from the
 * signed-in customer.
 * @param {object} addr Saved address.
 * @param {object|null} currentUser
 * @returns {object} Checkout form data.
 */
export function addressToFormData(addr, currentUser) {
  return {
    ...splitFullName(addr.fullName || currentUser?.name),
    email: currentUser?.email || addr.userEmail || "",
    phone: addr.phone || currentUser?.phone || "",
    street: addr.line1 || "",
    line2: addr.line2 || "",
    city: addr.city || "",
    state: addr.state || "",
    postalCode: addr.postalCode || "",
    country: addr.country || "India",
  };
}

/**
 * Blank checkout form values with the customer's contact details.
 * @param {object|null} currentUser
 * @returns {object} Checkout form data.
 */
export function newAddressFormData(currentUser) {
  return {
    ...splitFullName(currentUser?.name),
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    street: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  };
}

/**
 * Initial values for the add/edit address modal.
 * @param {object|null} editingAddress Address being edited, or null to add one.
 * @param {object|null} currentUser
 * @param {number} savedCount Number of saved addresses (the first becomes default).
 * @returns {object}
 */
export function addressModalValues(editingAddress, currentUser, savedCount) {
  if (editingAddress) {
    return {
      fullName: editingAddress.fullName || "",
      phone: editingAddress.phone || "",
      country: editingAddress.country || "India",
      line1: editingAddress.line1 || "",
      line2: editingAddress.line2 || "",
      city: editingAddress.city || "",
      state: editingAddress.state || "",
      postalCode: editingAddress.postalCode || "",
      tag: editingAddress.tag || "Home",
      isDefault: Boolean(editingAddress.isDefault),
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
    isDefault: savedCount === 0,
  };
}

/**
 * Required address fields from the address modal values, trimmed.
 * @param {object} values Address modal values.
 * @returns {{fullName: string, line1: string, city: string, postalCode: string}}
 */
export const requiredAddressFields = (values) => ({
  fullName: (
    values.fullName || `${values.firstName || ""} ${values.lastName || ""}`
  ).trim(),
  line1: (values.line1 || values.street || "").trim(),
  city: (values.city || "").trim(),
  postalCode: (values.postalCode || "").trim(),
});

/**
 * Saved-address API payload from the address modal values.
 * @param {object} values Address modal values.
 * @param {{fullName: string, line1: string, city: string, postalCode: string}} required Result of {@link requiredAddressFields}.
 * @param {object|null} currentUser
 * @returns {object}
 */
export const toAddressPayload = (values, { fullName, line1, city, postalCode }, currentUser) => ({
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
});

/**
 * Whether a saved address is selected and has street, city and PIN code.
 * @param {string|null} selectedAddressId
 * @param {object} formData Checkout form data.
 * @returns {boolean}
 */
export const hasDeliveryAddress = (selectedAddressId, formData) =>
  Boolean(
    selectedAddressId &&
      formData.street.trim() &&
      formData.city.trim() &&
      formData.postalCode.trim(),
  );

/**
 * Order API payload (shared by cash on delivery and PayU).
 * @param {object} options
 * @param {object} options.formData Checkout form data.
 * @param {object|null} options.currentUser
 * @param {{product: object, quantity: number}[]} options.lineItems
 * @param {object|null} options.appliedCoupon
 * @param {{method?: string}} options.shippingOption
 * @returns {object}
 */
export const buildOrderPayload = ({ formData, currentUser, lineItems, appliedCoupon, shippingOption }) => ({
  customer: {
    firstName: formData.firstName.trim(),
    lastName: formData.lastName.trim(),
    email: formData.email.trim(),
    phone: formData.phone.trim(),
    street: [formData.street, formData.line2]
      .filter(Boolean)
      .join(", ")
      .trim(),
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
  shippingMethod: shippingOption.method || "standard",
});

/**
 * Shipping option to charge for a delivery country: the shopper's chosen
 * option when it can ship there, otherwise that country's default. The API
 * rejects domestic methods for addresses abroad and international shipping
 * within India, and checkout has no shipping selector of its own.
 * @param {{method?: string, name?: string, price?: number}} shippingOption Option chosen in the bag.
 * @param {string} [country] Delivery country.
 * @returns {{method?: string, name?: string, price?: number}}
 */
export const shippingOptionForDestination = (shippingOption, country) => {
  const destination = String(country || "").trim();
  if (!destination) return shippingOption;
  const isDomestic = destination.toLowerCase() === "india";
  const method = shippingOption?.method || "standard";
  const fitsDestination = isDomestic
    ? method !== "international_express"
    : method === "international_express";
  return fitsDestination ? shippingOption : defaultShippingOptionFor(isDomestic ? "India" : destination);
};
