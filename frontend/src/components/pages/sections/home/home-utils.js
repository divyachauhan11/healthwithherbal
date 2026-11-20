/**
 * Pure helpers that pick and order the products and categories shown on the home page.
 */

/** Colour tone classes cycled through the featured category cards. */
export const CATEGORY_TONES = ["ochre", "green", "rose", "blue"];

/** Tabs of the "Fresh from the herbal shelf" section. */
export const SHELF_TABS = ["Latest", "Top rated", "Featured"];

/**
 * Names of the "concern" categories.
 * @param {Array<object>} categories
 * @returns {string[]}
 */
export const getConcernNames = (categories) =>
  categories
    .filter((c) => c && c.type === "concern")
    .map((c) => (typeof c === "string" ? c : c.name));

/**
 * Up to four featured parent categories, in navigation order.
 * @param {Array<object>} navigationCategories
 * @param {Array<string>} featuredCategoryIds
 * @returns {Array<object>}
 */
export function getFeaturedCategories(navigationCategories, featuredCategoryIds) {
  const featuredCategoryIdSet = new Set(featuredCategoryIds.map(String));
  return navigationCategories
    .filter(
      (category) =>
        category &&
        category.isParent &&
        featuredCategoryIdSet.has(String(category._id || category.id)),
    )
    .slice(0, 4);
}

/**
 * Four best-rated products (rating, then review count, then title).
 * @param {Array<object>} products
 * @returns {Array<object>}
 */
export const getBestsellers = (products) =>
  [...products]
    .sort((a, b) => {
      const ratingDiff = (Number(b.rating) || 0) - (Number(a.rating) || 0);
      if (ratingDiff !== 0) return ratingDiff;
      const reviewDiff = (Number(b.reviews) || 0) - (Number(a.reviews) || 0);
      if (reviewDiff !== 0) return reviewDiff;
      return (a.title || "").localeCompare(b.title || "");
    })
    .slice(0, 4);

/**
 * Four products for a herbal-shelf tab: the top rated for "Top rated",
 * otherwise the first four.
 * @param {Array<object>} products
 * @param {string} shelf One of {@link SHELF_TABS}.
 * @returns {Array<object>}
 */
export const getShelfProducts = (products, shelf) =>
  shelf === "Top rated"
    ? [...products]
        .sort(
          (a, b) =>
            (Number(b.rating) || 0) - (Number(a.rating) || 0) ||
            (Number(b.reviews) || 0) - (Number(a.reviews) || 0),
        )
        .slice(0, 4)
    : shelf === "Featured"
      ? products.slice(0, 4)
      : products.slice(0, 4);

/**
 * Products badged "new", or the first six when none are.
 * @param {Array<object>} products
 * @returns {Array<object>}
 */
export function getLaunchProducts(products) {
  if (!products || products.length === 0) return [];

  const newItems = products.filter(
    (p) => p.badge && p.badge.toLowerCase().includes("new"),
  );
  return newItems.length > 0 ? newItems : products.slice(0, 6);
}

/**
 * Normalise a brand record (or name) for the brand slider.
 * @param {string|object} b
 * @returns {{_id: string, name: string, slug: string, logoUrl: string, description: string}}
 */
export function toSliderBrand(b) {
  const name = typeof b === "string" ? b : b?.name || "";
  const slug =
    typeof b === "object" && b?.slug
      ? b.slug
      : name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const rawLogo =
    typeof b === "object"
      ? b?.logoUrl || b?.image || (Array.isArray(b?.images) && b.images.length > 0 ? b.images[0] : "")
      : "";

  const logoUrl = typeof rawLogo === "string" ? rawLogo.trim() : "";

  return {
    _id: typeof b === "object" ? b?._id : slug,
    name,
    slug,
    logoUrl: logoUrl || "",
    description: typeof b === "object" ? b?.description || "" : "",
  };
}
