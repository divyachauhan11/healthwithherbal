/**
 * Pure helpers that shape catalogue data for the header menus.
 */

/**
 * Brand display names from brand records or plain strings (empty names dropped).
 * @param {Array<string|{name?: string}>} brands
 * @returns {string[]}
 */
export const getBrandNames = (brands) =>
  brands.length
    ? brands
        .map((b) => (typeof b === "string" ? b : b?.name || ""))
        .filter(Boolean)
    : [];

/**
 * Categories shown in the menus: the navigation categories when there are
 * any, else all categories. Plain strings become `{name, type: "form"}`.
 * @param {Array<object|string>} navigationCategories
 * @param {Array<object|string>} categories
 * @returns {Array<object>}
 */
export const getMenuCategories = (navigationCategories, categories) =>
  (navigationCategories.length ? navigationCategories : categories)
    .map((category) =>
      typeof category === "string" ? { name: category, type: "form" } : category,
    )
    .filter((category) => category?.name);

/**
 * Group child categories under their parent category; children without a
 * known parent go to a trailing "More categories" group. Empty groups are dropped.
 * @param {Array<object>} activeCategories Result of {@link getMenuCategories}.
 * @returns {Array<{key: string, name: string, categories: Array<object>}>}
 */
export function groupCategoriesByParent(activeCategories) {
  const parentCategoryIds = new Set(
    activeCategories.filter((category) => category.isParent).map((category) => String(category._id)),
  );
  return [
    ...activeCategories
      .filter((category) => category.isParent)
      .map((parent) => ({
        key: String(parent._id || parent.name),
        name: parent.name,
        categories: activeCategories.filter(
          (category) => !category.isParent && String(category.parentId) === String(parent._id),
        ),
      })),
    ...(activeCategories.some(
      (category) => !category.isParent && (!category.parentId || !parentCategoryIds.has(String(category.parentId))),
    )
      ? [{
          key: "other-categories",
          name: "More categories",
          categories: activeCategories.filter(
            (category) => !category.isParent && (!category.parentId || !parentCategoryIds.has(String(category.parentId))),
          ),
        }]
      : []),
  ].filter((group) => group.categories.length > 0);
}

/**
 * Distribute category groups over four columns, always adding the next group
 * to the shortest column (a group's height is its category count + 2).
 * @param {Array<{categories: Array<object>}>} categoryGroups
 * @returns {Array<Array<object>>}
 */
export function balanceCategoryColumns(categoryGroups) {
  const categoryColumns = Array.from({ length: 4 }, () => []);
  const categoryColumnHeights = [0, 0, 0, 0];
  categoryGroups.forEach((group) => {
    const shortestColumn = categoryColumnHeights.indexOf(Math.min(...categoryColumnHeights));
    categoryColumns[shortestColumn].push(group);
    categoryColumnHeights[shortestColumn] += group.categories.length + 2;
  });
  return categoryColumns;
}
