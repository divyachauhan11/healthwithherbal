/**
 * Categories grouped under a parent category.
 * @param {Array<Object>} categoryRows All categories.
 * @param {string} parentId Parent category id.
 * @returns {Array<Object>}
 */
export const getChildCategories = (categoryRows, parentId) =>
  categoryRows.filter((category) => String(category.parentId) === String(parentId));

/**
 * Number of categories grouped under a parent category.
 * @param {Array<Object>} categoryRows All categories.
 * @param {string} parentId Parent category id.
 * @returns {number}
 */
export const countChildCategories = (categoryRows, parentId) =>
  getChildCategories(categoryRows, parentId).length;

/**
 * Total products across categories.
 * @param {Array<Object>} categories
 * @returns {number}
 */
export const sumProductCounts = (categories) => categories.reduce(
  (total, category) => total + Number(category.productCount || 0),
  0,
);
