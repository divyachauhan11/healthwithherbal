import {
  BLOG_COMMENT_STATUSES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  REFUND_STATUSES,
  RETURN_EXCHANGE_STATUSES,
} from "./statuses";

const makeStatusMap = (statuses, classForStatus, labelForStatus) =>
  Object.freeze(Object.fromEntries(statuses.map((status) => [
    status,
    Object.freeze({
      className: classForStatus(status),
      label: labelForStatus(status),
    }),
  ])));

export const STATUS_BADGE_MAPS = Object.freeze({
  order: Object.freeze({
    accountPill: makeStatusMap(
      ORDER_STATUSES,
      (status) => `status-${status}`,
      (status) => status,
    ),
    detail: makeStatusMap(
      ORDER_STATUSES,
      (status) => status.toLowerCase().replaceAll(" ", "-"),
      (status) => status,
    ),
    tracker: makeStatusMap(
      ORDER_STATUSES,
      (status) => `status-${status}`,
      (status) => status.toUpperCase(),
    ),
    receipt: makeStatusMap(
      ORDER_STATUSES,
      (status) => `status-${status}`,
      (status) => status.toUpperCase(),
    ),
  }),
  payment: makeStatusMap(
    PAYMENT_STATUSES,
    (status) => status,
    (status) => status,
  ),
  returnRequest: makeStatusMap(
    RETURN_EXCHANGE_STATUSES,
    (status) => `status-${status}`,
    (status) => status,
  ),
  refund: makeStatusMap(
    REFUND_STATUSES,
    (status) => `refund-status-${status}`,
    (status) => status === REFUND_STATUSES[0]
      ? "No refund required"
      : status === REFUND_STATUSES[1]
        ? "Refund pending"
        : "Refund completed",
  ),
  comment: Object.freeze({
    ...makeStatusMap(
      BLOG_COMMENT_STATUSES,
      (status) => status,
      (status) => status === BLOG_COMMENT_STATUSES[0] ? "Pending approval" : status,
    ),
  }),
  review: Object.freeze({
    approved: Object.freeze({ className: "", label: "Approved" }),
    rejected: Object.freeze({ className: "paused", label: "Rejected" }),
    pending: Object.freeze({ className: "processing", label: "Pending" }),
  }),
});
