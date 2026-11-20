/**
 * StatusBadge map for admin table status pills: label -> modifier class of
 * the `.status` element ("" = default green, "paused", "processing").
 */
export const RECORD_STATUS_BADGES = Object.freeze({
  Active: Object.freeze({ className: "" }),
  Approved: Object.freeze({ className: "" }),
  Disabled: Object.freeze({ className: "paused" }),
  Expired: Object.freeze({ className: "paused" }),
  Hidden: Object.freeze({ className: "paused" }),
  Paused: Object.freeze({ className: "paused" }),
  Pending: Object.freeze({ className: "processing" }),
  Rejected: Object.freeze({ className: "paused" }),
});

/**
 * Number of products linked to a category or brand record.
 * @param {{productCount?: number, count?: number}} record
 * @returns {number}
 */
export const getRecordProductCount = (record) => record.productCount ?? record.count ?? 0;

/**
 * Sort comparator for records by product count.
 * @param {Object} a
 * @param {Object} b
 * @returns {number}
 */
export const compareRecordProductCounts = (a, b) =>
  getRecordProductCount(a) - getRecordProductCount(b);
