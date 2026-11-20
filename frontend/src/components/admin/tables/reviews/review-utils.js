import { REVIEW_STATUSES } from "@/constants/statuses";

/**
 * Moderation label of a review: Approved, Rejected or Pending.
 * @param {Object} review
 * @returns {string}
 */
export const getReviewStatusLabel = (review) =>
  review.isApproved
    ? "Approved"
    : review.status === REVIEW_STATUSES[2]
    ? "Rejected"
    : "Pending";

/**
 * Toast message after a review is approved or rejected.
 * @param {boolean} isApproved
 * @returns {string}
 */
export const getModerationMessage = (isApproved) =>
  isApproved
    ? "Review approved and published to store."
    : "Review rejected/hidden from store.";
