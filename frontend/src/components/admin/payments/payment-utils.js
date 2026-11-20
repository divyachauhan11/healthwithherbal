import { PAYMENT_STATUSES } from "@/constants/statuses";

/** Payment status choices shown in the payments table, in display order. */
export const PAYMENT_STATUS_OPTIONS = Object.freeze([
  [PAYMENT_STATUSES[0], "Pending"],
  [PAYMENT_STATUSES[1], "Authorized"],
  [PAYMENT_STATUSES[2], "Paid"],
  [PAYMENT_STATUSES[3], "Failed"],
  [PAYMENT_STATUSES[4], "Refunded"],
]);

/**
 * Customer name for payment and order records: first + last name, then `name`, then "Customer".
 * @param {object} [customer]
 * @returns {string}
 */
export const getCustomerDisplayName = (customer) =>
  [customer?.firstName, customer?.lastName].filter(Boolean).join(" ") || customer?.name || "Customer";

/**
 * One-line postal address of an order, shipping or customer record.
 * Shared by the payment details and return review dialogs.
 * @param {object} [address]
 * @param {string} fallback Text returned when the address has no parts.
 * @returns {string}
 */
export const formatOrderAddress = (address, fallback) => [
  address?.street || address?.line1 || address?.addressLine1,
  address?.line2 || address?.addressLine2,
  address?.city,
  address?.state,
  address?.postalCode,
  address?.country,
].filter(Boolean).join(", ") || fallback;

/**
 * Stored line total of an order item, or unit price × quantity when it is missing.
 * @param {object} item
 * @returns {number}
 */
export const getOrderItemTotal = (item) =>
  item.lineTotal ?? Number(item.unitPrice || 0) * Number(item.quantity || 0);

/**
 * Shipping charge of an order (`shipping`, or the legacy `shippingFee`).
 * @param {object} order
 * @returns {number|undefined}
 */
export const getOrderShipping = (order) => order.shipping ?? order.shippingFee;

/**
 * Number of payments with the given status.
 * @param {Array<object>} rows
 * @param {string} status
 * @returns {number}
 */
export const countPaymentsWithStatus = (rows, status) =>
  rows.filter((payment) => payment.status === status).length;

/**
 * Totals for the payment summary cards and status filters.
 * @param {Array<object>} rows
 * @returns {{all: number, pending: number, paid: number, refunded: number}}
 */
export const countPayments = (rows) => ({
  all: rows.length,
  pending: countPaymentsWithStatus(rows, PAYMENT_STATUSES[0]),
  paid: countPaymentsWithStatus(rows, PAYMENT_STATUSES[2]),
  refunded: countPaymentsWithStatus(rows, PAYMENT_STATUSES[4]),
});

/**
 * Update body that changes a payment's status while keeping its other recorded fields.
 * A payment marked paid keeps its `paidAt` or is stamped with the current time.
 * @param {object} payment
 * @param {string} status
 * @returns {object}
 */
export const buildPaymentStatusUpdate = (payment, status) => ({
  method: payment.method || "unknown",
  gateway: payment.gateway || "",
  gatewayTxnId: payment.gatewayTxnId || "",
  amount: Number(payment.amount) || 0,
  currency: payment.currency || "INR",
  status,
  paidAt: status === PAYMENT_STATUSES[2] ? payment.paidAt || new Date().toISOString() : payment.paidAt || null,
});
