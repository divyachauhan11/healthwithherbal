/** Caption shown under the star selector for each rating. */
export const RATING_DESCRIPTIONS = {
  1: "Poor — Did not meet expectations",
  2: "Fair — Below expectations",
  3: "Good — Acceptable herbal quality",
  4: "Very Good — Satisfied with results",
  5: "Exceptional — Loved the benefits & purity! 🌿",
};

/**
 * Product name shown and submitted with a review.
 * @param {object} product Reviewed product / order line.
 * @returns {string}
 */
export const reviewProductTitle = (product) => product.title || product.name || "Herbal Product";

/**
 * Brand shown above the reviewed product's name.
 * @param {object} product Reviewed product / order line.
 * @returns {string}
 */
export const reviewBrandName = (product) => product.brand || "Health with Herbal";

/**
 * Order number the review is attached to ("" without an order).
 * @param {object} [order]
 * @returns {string}
 */
export const reviewOrderNumber = (order) => order?.orderNumber || "";

/**
 * Default reviewer display name: the customer's name, else the order's customer name.
 * @param {object|null} [currentUser]
 * @param {object} [order]
 * @returns {string}
 */
export const defaultReviewerName = (currentUser, order) =>
  currentUser?.name ||
  (order?.customer
    ? `${order.customer.firstName || ""} ${order.customer.lastName || ""}`.trim()
    : "") ||
  "";

/**
 * Default reviewer email: the customer's email, else the order's customer email.
 * @param {object|null} [currentUser]
 * @param {object} [order]
 * @returns {string}
 */
export const defaultReviewerEmail = (currentUser, order) =>
  currentUser?.email || order?.customer?.email || "";
