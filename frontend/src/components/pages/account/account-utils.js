import { RETURN_EXCHANGE_TYPES } from "@/constants/statuses";

/**
 * Whether a return/exchange request belongs to an order line: by its stored
 * line index when present, otherwise by product title (case-insensitive).
 * @param {object} request Return/exchange request.
 * @param {object} item Order line.
 * @param {number} itemIndex Index of the line in the order.
 * @returns {boolean}
 */
export const returnRequestMatchesItem = (request, item, itemIndex) => {
  if (Number.isInteger(request.itemIndex)) return request.itemIndex === itemIndex;
  return String(request.item?.title || "").trim().toLowerCase() === String(item.title || "").trim().toLowerCase();
};

/**
 * Image URL of an order line: its own image, else its product's.
 * @param {object} [item] Order line.
 * @returns {string|undefined}
 */
export const orderItemImage = (item) => item?.image || item?.product?.image || item?.product?.images?.[0];

/**
 * Order date and time on account order cards.
 * @param {string|number|Date} value
 * @returns {string}
 */
export const formatOrderCardDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/**
 * Value with its first character upper-cased.
 * @param {string} value
 * @returns {string}
 */
export const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

/**
 * Contact shown in the account sidebar: "+91 " and the phone's last 10
 * digits, or the email when the customer has no phone.
 * @param {object} user Signed-in customer.
 * @returns {string}
 */
export const getDisplayPhone = (user) => {
  const cleanPhone = (user.phone || "").replace(/\D/g, "").slice(-10);
  return cleanPhone ? `+91 ${cleanPhone}` : user.email;
};

/**
 * Whether the address form has every required field filled in.
 * @param {object} formData Address form values.
 * @returns {boolean}
 */
export const hasRequiredAddressFields = (formData) =>
  Boolean(
    formData.fullName?.trim() &&
    formData.line1?.trim() &&
    formData.city?.trim() &&
    formData.postalCode?.trim(),
  );

/**
 * Request body for creating or updating a saved address.
 * @param {object} formData Address form values (required fields present).
 * @param {object|null} currentUser Signed-in customer.
 * @returns {object}
 */
export const buildAddressPayload = (formData, currentUser) => ({
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
});

/**
 * Initial values of the "add address" form (a new object on every call).
 * @param {object|null} currentUser Signed-in customer.
 * @param {boolean} isFirstAddress The customer has no saved address yet.
 * @returns {object}
 */
export const newAddressDefaults = (currentUser, isFirstAddress) => ({
  fullName: currentUser?.name || "",
  phone: currentUser?.phone || "",
  country: "India",
  tag: "Home",
  isDefault: isFirstAddress,
});

/**
 * `mailto:` link drafting a return/exchange request email to the store.
 * @param {object} request
 * @param {string} request.type Request type (return or exchange).
 * @param {string} request.orderNumber
 * @param {string} request.itemTitle
 * @param {number|string} request.quantity
 * @param {string} request.reason
 * @param {string[]} request.photoUrls Uploaded photo URLs.
 * @returns {string}
 */
export const buildReturnRequestMailto = ({ type, orderNumber, itemTitle, quantity, reason, photoUrls }) => {
  const subject = `${type === RETURN_EXCHANGE_TYPES[0] ? "Return" : "Exchange"} request for order ${orderNumber}`;
  const body = `Hello,\n\nI would like to request a ${type}.\nOrder: ${orderNumber}\nItem: ${itemTitle}\nQuantity: ${quantity}\nReason: ${reason || "Not provided"}\n${photoUrls.length ? `Photo links:\n${photoUrls.join("\n")}\n` : ""}\nPlease let me know the next steps.`;
  return `mailto:healthwithherbalindia@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

/**
 * Orders with `request` appended to the return/exchange requests of the order `orderNumber`.
 * @param {object[]} orders
 * @param {string} orderNumber
 * @param {object} request Newly created request.
 * @returns {object[]}
 */
export const addReturnRequestToOrders = (orders, orderNumber, request) =>
  orders.map((order) => order.orderNumber === orderNumber
    ? { ...order, returnExchangeRequests: [...(order.returnExchangeRequests || []), request] }
    : order);
