import {
  REFUND_STATUSES,
  RETURN_EXCHANGE_STATUSES,
  RETURN_EXCHANGE_TYPES,
} from "@/constants/statuses";
import { currencyFixed, dateLabel } from "@/components/admin/global/admin-utils";
import { formatOrderAddress } from "@/components/admin/payments/payment-utils";

/** Request status choices (value, label) in display order. */
export const REQUEST_STATUS_OPTIONS = Object.freeze([
  [RETURN_EXCHANGE_STATUSES[0], "Pending"],
  [RETURN_EXCHANGE_STATUSES[1], "Approved"],
  [RETURN_EXCHANGE_STATUSES[2], "Rejected"],
  [RETURN_EXCHANGE_STATUSES[3], "Completed"],
]);

/** Refund status choices for the review form. */
export const REFUND_STATUS_OPTIONS = Object.freeze([
  [REFUND_STATUSES[0], "No refund required"],
  [REFUND_STATUSES[1], "Refund pending"],
  [REFUND_STATUSES[2], "Refund completed"],
]);

/** Refund method choices for the review form. */
export const REFUND_METHOD_OPTIONS = Object.freeze([
  ["not_applicable", "Choose method"],
  ["original_payment", "Original payment method"],
  ["bank_transfer", "Bank transfer"],
  ["cash", "Cash"],
  ["store_credit", "Store credit"],
  ["other", "Other"],
]);

/** Request type filter choices. */
export const REQUEST_TYPE_FILTER_OPTIONS = Object.freeze([
  ["all", "All types"],
  [RETURN_EXCHANGE_TYPES[0], "Returns"],
  [RETURN_EXCHANGE_TYPES[1], "Exchanges"],
]);

/** Request status filter choices. */
export const REQUEST_STATUS_FILTER_OPTIONS = Object.freeze([
  ["all", "All request statuses"],
  ...REQUEST_STATUS_OPTIONS,
]);

/** Refund status filter choices. */
export const REFUND_STATUS_FILTER_OPTIONS = Object.freeze([
  ["all", "All refund statuses"],
  [REFUND_STATUSES[1], "Refund pending"],
  [REFUND_STATUSES[2], "Refund completed"],
  [REFUND_STATUSES[0], "No refund required"],
]);

/**
 * Append the pending count to the "Pending" option label when there are pending requests.
 * @param {Array<[string, string]>} options
 * @param {number} pendingCount
 * @returns {Array<[string, string]>}
 */
export const withPendingCount = (options, pendingCount) =>
  options.map(([value, label]) => [
    value,
    value === RETURN_EXCHANGE_STATUSES[0] && pendingCount ? `${label} (${pendingCount})` : label,
  ]);

/**
 * Short reference shown for a request: the last seven ID characters, upper-cased.
 * @param {string} id
 * @returns {string}
 */
export const formatRequestReference = (id) => String(id).slice(-7).toUpperCase();

/**
 * Lower-case request type; requests without a type are returns.
 * @param {object} request
 * @returns {string}
 */
export const getRequestType = (request) =>
  String(request.type || RETURN_EXCHANGE_TYPES[0]).toLowerCase();

/** Whether a request is a return (and so can track a refund). */
export const isReturnTypeRequest = (request) => getRequestType(request) === RETURN_EXCHANGE_TYPES[0];

/** Customer name on a request, or "Customer". */
export const getRequestCustomerName = (request) => request.customer?.name || "Customer";

/** Unit price of the requested item as a number (0 when missing). */
export const getRequestUnitPrice = (request) => Number(request.item?.unitPrice) || 0;

/** Value of the requested item: unit price × requested quantity (at least one). */
export const getSuggestedRefund = (request) =>
  getRequestUnitPrice(request) * (Number(request.quantity) || 1);

/**
 * Customer name on the linked order, falling back to the request's customer name.
 * @param {object} order
 * @param {object} request
 * @returns {string}
 */
export const getOrderCustomerName = (order, request) =>
  [order?.customer?.firstName, order?.customer?.lastName].filter(Boolean).join(" ")
  || getRequestCustomerName(request);

/** One-line order address, or "No address provided". */
export const formatReturnAddress = (address) => formatOrderAddress(address, "No address provided");

/** Amount formatted with two decimals in the order's currency (INR by default). */
export const formatOrderMoney = (value, order) => currencyFixed(value, order?.currency || "INR");

/** Whether an order item is the one the request was raised for (matched by title). */
export const isRequestedOrderItem = (item, request) =>
  String(item.title || "").trim().toLowerCase() === String(request.item?.title || "").trim().toLowerCase();

/**
 * Gateway, currency and timeline details of a payment record, joined with " · ".
 * @param {object} payment
 * @param {object} order
 * @returns {string}
 */
export const describePaymentRecord = (payment, order) => [
  payment._id && `Payment ID ${payment._id}`,
  payment.gateway,
  `Currency ${payment.currency || order.currency || "INR"}`,
  payment.gatewayTxnId && `Transaction ${payment.gatewayTxnId}`,
  payment.createdAt && `Recorded ${dateLabel(payment.createdAt)}`,
  payment.paidAt && `Paid ${dateLabel(payment.paidAt)}`,
].filter(Boolean).join(" · ") || "No gateway or transaction details";

/**
 * Table label for a request's refund status (missing status counts as pending).
 * @param {string} [refundStatus]
 * @returns {string}
 */
export const getRefundStatusLabel = (refundStatus) =>
  refundStatus === REFUND_STATUSES[2]
    ? "Refund completed"
    : refundStatus === REFUND_STATUSES[1] || !refundStatus
      ? "Refund pending"
      : "No refund required";

/**
 * Editable review form values for a request, with defaults for missing fields.
 * @param {object} request
 * @returns {object}
 */
export const createReviewForm = (request) => ({
  status: request.status || RETURN_EXCHANGE_STATUSES[0],
  adminNote: request.adminNote || "",
  refundStatus: request.refundStatus || REFUND_STATUSES[1],
  refundAmount: request.refundAmount ?? "",
  refundMethod: request.refundMethod || "not_applicable",
  refundReference: request.refundReference || "",
});

/**
 * Local calendar date (YYYY-MM-DD) of a timestamp, or "" when it is missing or invalid.
 * @param {string|number|Date} [value]
 * @returns {string}
 */
export const toLocalDateKey = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    : "";
};

/**
 * Request totals used by the filter bar.
 * @param {Array<object>} rows
 * @returns {{all: number, pending: number, approved: number, completed: number}}
 */
export const countReturnRequests = (rows) => ({
  all: rows.length,
  pending: rows.filter((row) => row.status === RETURN_EXCHANGE_STATUSES[0]).length,
  approved: rows.filter((row) => row.status === RETURN_EXCHANGE_STATUSES[1]).length,
  completed: rows.filter((row) => row.status === RETURN_EXCHANGE_STATUSES[3]).length,
});

/**
 * Requests matching the queue filters and free-text search.
 * @param {Array<object>} rows
 * @param {{status: string, type: string, refund: string, dateFrom: string, dateTo: string, query: string}} filters
 *   "all" disables a status/type/refund filter; dates are inclusive YYYY-MM-DD bounds.
 * @returns {Array<object>}
 */
export const filterReturnRequests = (rows, { status, type, refund, dateFrom, dateTo, query }) =>
  rows.filter((row) => {
    const dateKey = toLocalDateKey(row.createdAt);
    const rowRefundStatus = row.refundStatus || REFUND_STATUSES[1];
    return (status === "all" || row.status === status) &&
      (type === "all" || getRequestType(row) === type) &&
      (refund === "all" || rowRefundStatus === refund) &&
      (!dateFrom || (dateKey && dateKey >= dateFrom)) &&
      (!dateTo || (dateKey && dateKey <= dateTo)) &&
      (!query.trim() || JSON.stringify(row).toLowerCase().includes(query.trim().toLowerCase()));
  });
