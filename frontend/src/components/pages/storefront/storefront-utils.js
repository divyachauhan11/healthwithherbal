/**
 * Pure helpers for the storefront shell: URL <-> page mapping, content-page
 * slugs and `/store/init` normalisation.
 */

/** Content pages served under `/pages/<slug>`. */
export const CONTENT_PAGES = ["Our Story", "Contact Us", "Shipping Policy", "Returns & Refunds", "Privacy Policy", "Terms & Conditions", "Disclaimer"];

/**
 * URL slug for a content page title ("Returns & Refunds" -> "returns-and-refunds").
 * @param {string} [value] Page title; empty values map to "our-story".
 * @returns {string}
 */
export const contentSlug = (value) =>
  String(value || "our-story")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Content page title for a URL slug; unknown slugs are title-cased.
 * @param {string} slug
 * @returns {string}
 */
export const contentLabel = (slug) => CONTENT_PAGES.find((label) => contentSlug(label) === slug) || slug.split("-").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ");

/**
 * Coerce a `/store/init` payload (or its cached copy) into the store-data
 * shape, replacing missing lists with empty arrays.
 * @param {object} [data]
 * @returns {object}
 */
export const normalizeStoreData = (data = {}) => ({
  products: Array.isArray(data.products) ? data.products : [],
  categories: Array.isArray(data.categories) ? data.categories : [],
  navigationCategories: Array.isArray(data.navigationCategories)
    ? data.navigationCategories
    : Array.isArray(data.categories) ? data.categories : [],
  featuredCategoryIds: Array.isArray(data.featuredCategoryIds) ? data.featuredCategoryIds : [],
  brands: Array.isArray(data.brands) ? data.brands : [],
  coupons: Array.isArray(data.coupons) ? data.coupons : [],
  announcements: Array.isArray(data.announcements) ? data.announcements : [],
  blogs: Array.isArray(data.blogs) ? data.blogs : [],
  reviews: Array.isArray(data.reviews) ? data.reviews : [],
});

/**
 * Storefront page for the current browser URL (path first, then `?page=`).
 * @returns {string} Page id such as "home", "shop", "product" or "order-details".
 */
export function pageFromLocation() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const segments = path.split("/").filter(Boolean);
  if (segments[0] === "account" && segments[1] === "orders" && segments[2] && segments[3] === "invoice") return "order-invoice";
  if (segments[0] === "account" && segments[1] === "orders" && segments[2]) return "order-details";
  if (segments[0] === "pages" && segments[1] === "order-history") return "account";
  const routes = {
    shop: "shop", wishlist: "wishlist", blog: "blog", info: "content",
    pages: "content", checkout: "checkout", account: "account",
    "order-confirmation": "order-placed", product: "product",
  };
  return segments[0]
    ? routes[segments[0]] || new URLSearchParams(window.location.search).get("page") || "home"
    : new URLSearchParams(window.location.search).get("page") || "home";
}

/**
 * URL path that `navigate(next, options)` pushes for a page.
 * @param {string} next Page id.
 * @param {{orderId?: string}} options Navigation options (order pages use `orderId`).
 * @param {string} contentPage Current content page title (used by "content").
 * @returns {string}
 */
export function pagePath(next, options, contentPage) {
  const paths = {
    home: "/", shop: "/shop", wishlist: "/wishlist", blog: "/blog",
    info: `/pages/${contentSlug("Our Story")}`, content: `/pages/${contentSlug(contentPage)}`,
    checkout: "/checkout", "order-placed": "/order-confirmation", account: "/account",
  };
  return (next === "order-details" || next === "order-invoice") && options.orderId
    ? `/account/orders/${encodeURIComponent(options.orderId)}${next === "order-invoice" ? "/invoice" : ""}`
    : paths[next] || `/${contentSlug(next)}`;
}

/**
 * Product shown on the product page: the one matching `selectedId` (by id,
 * `_id` or slug), else the first product, else null.
 * @param {Array<object>} products
 * @param {string|number|null} selectedId
 * @returns {object|null}
 */
export const findSelectedProduct = (products, selectedId) =>
  (selectedId ? products.find((product) => product.id === selectedId || product._id === selectedId || product.slug === selectedId) : null) ||
  products[0] ||
  null;
