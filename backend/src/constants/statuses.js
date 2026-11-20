const ORDER_STATUSES = Object.freeze([
  "placed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);
const PAYMENT_STATUSES = Object.freeze([
  "pending",
  "authorized",
  "paid",
  "failed",
  "refunded",
]);
const RETURN_EXCHANGE_TYPES = Object.freeze(["return", "exchange"]);
const RETURN_EXCHANGE_STATUSES = Object.freeze([
  "pending",
  "approved",
  "rejected",
  "completed",
]);
const REFUND_STATUSES = Object.freeze([
  "not_required",
  "pending",
  "processed",
]);
const REFUND_METHODS = Object.freeze([
  "not_applicable",
  "original_payment",
  "bank_transfer",
  "cash",
  "store_credit",
  "other",
]);
const BLOG_POST_STATUSES = Object.freeze(["draft", "published"]);
const BLOG_COMMENT_STATUSES = Object.freeze([
  "pending",
  "approved",
  "spam",
  "rejected",
]);
const REVIEW_STATUSES = Object.freeze(["pending", "approved", "rejected"]);
const DISCOUNT_TYPES = Object.freeze(["percent", "fixed", "free_shipping"]);
const PAYMENT_METHODS = Object.freeze(["cash_on_delivery", "payu"]);

module.exports = {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  RETURN_EXCHANGE_TYPES,
  RETURN_EXCHANGE_STATUSES,
  REFUND_STATUSES,
  REFUND_METHODS,
  BLOG_POST_STATUSES,
  BLOG_COMMENT_STATUSES,
  REVIEW_STATUSES,
  DISCOUNT_TYPES,
  PAYMENT_METHODS,
};
