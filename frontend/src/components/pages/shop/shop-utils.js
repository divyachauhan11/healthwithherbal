/**
 * Pure helpers for the shop page: filter options, counts, filtering and sorting.
 */

/** Sort options of the results toolbar. */
export const SHOP_SORT_OPTIONS = ["Featured", "Price: Low to high", "Top rated", "Newest"];

const uniqueSorted = (names) => Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));

/**
 * Distinct brand names, alphabetically.
 * @param {Array<string|{name?: string}>} brands
 * @returns {string[]}
 */
export const getBrandOptions = (brands) =>
  uniqueSorted(
    brands
      .map((b) => (typeof b === "string" ? b : b?.name || ""))
      .filter(Boolean),
  );

/**
 * Distinct product-form category names (type "form" or untyped), alphabetically.
 * @param {Array<string|object>} categories
 * @returns {string[]}
 */
export const getFormCategoryOptions = (categories) =>
  uniqueSorted(
    categories
      .filter((c) => c && (c.type === "form" || !c.type))
      .map((c) => (typeof c === "string" ? c : c.name))
      .filter(Boolean),
  );

/**
 * Distinct health-concern category names (type "concern"), alphabetically.
 * @param {Array<string|object>} categories
 * @returns {string[]}
 */
export const getConcernOptions = (categories) =>
  uniqueSorted(
    categories
      .filter((c) => c && c.type === "concern")
      .map((c) => (typeof c === "string" ? c : c.name))
      .filter(Boolean),
  );

/**
 * Product counts per category, concern and brand (keys lower-cased). A product
 * counts for a concern when its title, category or description mentions it or
 * its category is that concern.
 * @param {Array<object>} products
 * @param {string[]} concernOptions
 * @returns {{catMap: object, concernMap: object, brandMap: object}}
 */
export function countFilterMatches(products, concernOptions) {
  const catMap = {};
  const concernMap = {};
  const brandMap = {};

  products.forEach((product) => {
    // Category count
    const cat = (product.category || "").toLowerCase().trim();
    if (cat) catMap[cat] = (catMap[cat] || 0) + 1;

    // Brand count
    const br = (product.brand || "").toLowerCase().trim();
    if (br) brandMap[br] = (brandMap[br] || 0) + 1;

    // Concern count
    const pText = `${product.title || ""} ${product.category || ""} ${product.description || ""}`.toLowerCase();
    concernOptions.forEach((con) => {
      const cLower = con.toLowerCase().trim();
      if (pText.includes(cLower) || cat === cLower) {
        concernMap[cLower] = (concernMap[cLower] || 0) + 1;
      }
    });
  });

  return { catMap, concernMap, brandMap };
}

/**
 * Heading copy for a catalogue view.
 * @param {string} [view]
 * @returns {{eyebrow: string, title: string, copy: string}}
 */
export function getShopHeading(view) {
  const viewTitle = view || "All Products";
  return {
    eyebrow: "The Herbal Shelf",
    title: viewTitle,
    copy:
      view === "Brands"
        ? "Authentic herbal remedies from respected makers."
        : `Explore our collection of authentic ${viewTitle.toLowerCase()} remedies.`,
  };
}

/**
 * Products matching the catalogue view, the selected facet, the checked
 * category/concern/brand filters and the search term.
 * @param {Array<object>} products
 * @param {object} filters
 * @param {string} [filters.view]
 * @param {string} filters.selectedFacet
 * @param {string[]} filters.selectedCategories
 * @param {string[]} filters.selectedConcerns
 * @param {string[]} filters.selectedBrands
 * @param {string} filters.term
 * @returns {Array<object>}
 */
export function filterShopProducts(
  products,
  { view, selectedFacet, selectedCategories, selectedConcerns, selectedBrands, term },
) {
  return products
    .filter((product) => {
      if (view === "Brands" && selectedFacet) {
        return (
          product.brand?.toLowerCase() === selectedFacet.toLowerCase()
        );
      }
      if (view === "Shop by Concern" && selectedFacet) {
        return `${product.title} ${product.category} ${product.description || ""}`
          .toLowerCase()
          .includes(selectedFacet.toLowerCase());
      }
      if (view && view !== "All Products" && view !== "Brands" && view !== "Shop by Concern") {
        const vLower = view.toLowerCase();
        return (
          product.category?.toLowerCase() === vLower ||
          product.brand?.toLowerCase() === vLower
        );
      }
      return true;
    })
    .filter((product) => {
      if (selectedCategories.length === 0) return true;
      return selectedCategories.some(
        (cat) => product.category?.toLowerCase() === cat.toLowerCase()
      );
    })
    .filter((product) => {
      if (selectedConcerns.length === 0) return true;
      return selectedConcerns.some((con) =>
        `${product.title} ${product.category} ${product.description || ""}`
          .toLowerCase()
          .includes(con.toLowerCase())
      );
    })
    .filter((product) => {
      if (selectedBrands.length === 0) return true;
      return selectedBrands.some(
        (b) => product.brand?.toLowerCase() === b.toLowerCase()
      );
    })
    .filter((product) =>
      `${product.title} ${product.brand} ${product.category} ${product.description || ""}`
        .toLowerCase()
        .includes(term.trim().toLowerCase())
    );
}

/**
 * A sorted copy of `products` for one of {@link SHOP_SORT_OPTIONS}
 * ("Featured": badged first, then by review count).
 * @param {Array<object>} products
 * @param {string} sort
 * @returns {Array<object>}
 */
export const sortShopProducts = (products, sort) =>
  [...products].sort((a, b) => {
    if (sort === "Price: Low to high") return a.price - b.price;
    if (sort === "Top rated")
      return b.rating - a.rating || b.reviews - a.reviews;
    if (sort === "Newest") return b.id - a.id;
    return (
      Number(Boolean(b.badge)) - Number(Boolean(a.badge)) ||
      b.reviews - a.reviews
    );
  });

/**
 * `list` with `value` removed if present, otherwise appended.
 * @template T
 * @param {T[]} list
 * @param {T} value
 * @returns {T[]}
 */
export const toggleListValue = (list, value) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
