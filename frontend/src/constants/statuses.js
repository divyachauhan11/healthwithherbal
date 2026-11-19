export const ORDER_STATUSES = Object.freeze([
  "placed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export const PAYMENT_STATUSES = Object.freeze([
  "pending",
  "authorized",
  "paid",
  "failed",
  "refunded",
]);

export const RETURN_EXCHANGE_TYPES = Object.freeze(["return", "exchange"]);

export const RETURN_EXCHANGE_STATUSES = Object.freeze([
  "pending",
  "approved",
  "rejected",
  "completed",
]);

export const REFUND_STATUSES = Object.freeze([
  "not_required",
  "pending",
  "processed",
]);

export const BLOG_COMMENT_STATUSES = Object.freeze([
  "pending",
  "approved",
  "spam",
  "rejected",
]);

export const REVIEW_STATUSES = Object.freeze([
  "pending",
  "approved",
  "rejected",
]);
