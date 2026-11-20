import { currency } from "../../global/admin-utils";

/**
 * Customer name for the order details view ("Customer" when unnamed).
 * @param {Object} order
 * @returns {string}
 */
export const getOrderCustomerName = (order) =>
  [order.customer?.firstName, order.customer?.lastName]
    .filter(Boolean)
    .join(" ") || "Customer";

/**
 * Format an amount in the order's currency (INR by default); empty values show as zero.
 * @param {Object} order
 * @param {number|string} amount
 * @returns {string}
 */
export const formatOrderAmount = (order, amount) =>
  currency(Number(amount) || 0, order.currency || "INR");

/**
 * One-line address from any of the address shapes stored on orders.
 * @param {Object} [value] Address or customer object.
 * @returns {string}
 */
export const formatOrderAddress = (value) => [
  value?.street || value?.line1 || value?.addressLine1,
  value?.line2,
  value?.addressLine2,
  value?.city,
  value?.state,
  value?.postalCode,
  value?.country,
].filter(Boolean).join(", ") || "No address provided";

/**
 * Readable payment method ("cash_on_delivery" becomes "cash on delivery").
 * @param {Object} order
 * @returns {string}
 */
export const formatPaymentMethod = (order) =>
  String(order.paymentMethod || "Cash on delivery").replaceAll("_", " ");

/**
 * Payment status label; cash orders without a status are "Due on delivery".
 * @param {Object} order
 * @returns {string}
 */
export const getPaymentStatusLabel = (order) =>
  order.paymentStatus || (order.paymentMethod === "cash_on_delivery" ? "Due on delivery" : "—");

/**
 * Line total of an order item: the stored total, else unit price × quantity.
 * @param {Object} item
 * @returns {number}
 */
export const getOrderItemTotal = (item) =>
  item.lineTotal ?? Number(item.unitPrice || 0) * Number(item.quantity || 1);

/**
 * "Title ×qty" list of all items, used as the items cell tooltip.
 * @param {Array<Object>} items
 * @returns {string}
 */
export const summarizeOrderItems = (items) => items
  .map(
    (item) =>
      `${item.title || item.name || "Product"} ×${item.quantity || 1}`,
  )
  .join(", ");

/** Sort comparator: customer first name. */
export const compareOrderCustomers = (a, b) =>
  (a.customer?.firstName || "").localeCompare(
    b.customer?.firstName || "",
  );

/** Sort comparator: order total. */
export const compareOrderTotals = (a, b) => (a.total || 0) - (b.total || 0);
