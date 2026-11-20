/**
 * The single owner of browser storage. Components and API modules read and
 * write persisted state only through these functions, so storage keys and
 * formats live in one place (see `constants/storage-keys.js`).
 *
 * Like `localStorage` itself, these functions throw when storage is
 * unavailable; callers decide whether that failure matters.
 */
import { STORAGE_KEYS } from "@/constants/storage-keys";

const createRandomId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;

/* ------------------------------------------------------------------ */
/* Customer session                                                    */
/* ------------------------------------------------------------------ */

/** Read the customer profile JSON and raw token in their existing read order. */
export function getCustomerSession() {
  const user = localStorage.getItem(STORAGE_KEYS.USER);
  const token = localStorage.getItem(STORAGE_KEYS.USER_SESSION_TOKEN);
  return { user, token };
}

/** Persist the raw customer token and token-free profile JSON. */
export function saveCustomerSession(user) {
  if (user.sessionToken) {
    localStorage.setItem(STORAGE_KEYS.USER_SESSION_TOKEN, user.sessionToken);
  }
  const safeUser = { ...user };
  delete safeUser.sessionToken;
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(safeUser));
}

/** Remove customer profile and token using the existing removal order. */
export function clearCustomerSession() {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.USER_SESSION_TOKEN);
}

/** Read the raw customer token for API authorization. */
export function getCustomerSessionToken() {
  return localStorage.getItem(STORAGE_KEYS.USER_SESSION_TOKEN);
}

/* ------------------------------------------------------------------ */
/* Admin session and portal UI state                                   */
/* ------------------------------------------------------------------ */

/** Read the raw admin token. */
export function getAdminSessionToken() {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
}

/** Read the serialized admin profile value. */
export function getAdminUser() {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
}

/** Save only the admin profile JSON, as done after session validation. */
export function saveAdminUser(user) {
  localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(user));
}

/** Persist the raw admin token followed by the admin profile JSON. */
export function saveAdminSession(token, user) {
  localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, token);
  localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(user));
}

/** Remove admin token and profile using the existing removal order. */
export function clearAdminSession() {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
}

/** @returns {string|null} The admin page shown last. */
export function getStoredAdminPage() {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_PAGE);
}

/** @returns {string|null} The admin search query used last. */
export function getStoredAdminQuery() {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_QUERY);
}

/**
 * Remember the admin page and search query; an empty query is removed.
 * @param {string} page
 * @param {string} query Trimmed search query.
 */
export function saveAdminPortalState(page, query) {
  localStorage.setItem(STORAGE_KEYS.ADMIN_PAGE, page);
  if (query) localStorage.setItem(STORAGE_KEYS.ADMIN_QUERY, query);
  else localStorage.removeItem(STORAGE_KEYS.ADMIN_QUERY);
}

/** Forget the remembered admin page and search query (on sign-out). */
export function clearAdminPortalState() {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_PAGE);
  localStorage.removeItem(STORAGE_KEYS.ADMIN_QUERY);
}

/* ------------------------------------------------------------------ */
/* Cart                                                                */
/* ------------------------------------------------------------------ */

/**
 * Read an existing anonymous cart ID or create one with the caller's legacy
 * generator. The two callers intentionally retain their different fallbacks.
 * @param {"storefront"|"cartDrawer"} source
 */
export function getCartSessionId(source = "storefront") {
  const existing = localStorage.getItem(STORAGE_KEYS.CART_SESSION);
  if (existing) return existing;

  const sessionId = source === "cartDrawer"
    ? `sess_${Math.random().toString(36).slice(2, 12)}`
    : `sess_${window.crypto?.randomUUID?.() || Math.random().toString(36).slice(2, 14)}`;
  localStorage.setItem(STORAGE_KEYS.CART_SESSION, sessionId);
  return sessionId;
}

/** @returns {boolean} Whether a cart has ever been saved in this browser. */
export function hasStoredCart() {
  return localStorage.getItem(STORAGE_KEYS.CART) !== null;
}

/**
 * @returns {unknown} The saved cart value (normally an array of product IDs).
 * @throws {SyntaxError} When the stored value is not valid JSON.
 */
export function getStoredCart() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || "[]");
}

/** @param {Array<string|number>} productIds One entry per unit in the cart. */
export function saveStoredCart(productIds) {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(productIds));
}

/** Remove the saved cart (after a paid order). */
export function clearStoredCart() {
  localStorage.removeItem(STORAGE_KEYS.CART);
}

/** Remove the legacy local wishlist left by older storefront versions. */
export function clearLegacyWishlist() {
  localStorage.removeItem(STORAGE_KEYS.LEGACY_WISHLIST);
}

/* ------------------------------------------------------------------ */
/* Store data and orders                                               */
/* ------------------------------------------------------------------ */

/**
 * @returns {object|null} The last cached `/store/init` payload.
 * @throws {SyntaxError} When the stored value is not valid JSON.
 */
export function getCachedStoreData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.STORE_INIT_CACHE) || "null");
}

/** @param {object} storeData Normalized store payload to cache. */
export function saveCachedStoreData(storeData) {
  localStorage.setItem(STORAGE_KEYS.STORE_INIT_CACHE, JSON.stringify(storeData));
}

/**
 * @returns {object|null} The most recently placed order, if one was saved.
 * @throws {SyntaxError} When the stored value is not valid JSON.
 */
export function getLastOrder() {
  const saved = localStorage.getItem(STORAGE_KEYS.LAST_ORDER);
  return saved ? JSON.parse(saved) : null;
}

/** @param {object} order The order to show on the confirmation page. */
export function saveLastOrder(order) {
  localStorage.setItem(STORAGE_KEYS.LAST_ORDER, JSON.stringify(order));
}

/* ------------------------------------------------------------------ */
/* Blog visitor                                                        */
/* ------------------------------------------------------------------ */

/**
 * Anonymous, persistent visitor ID used to de-duplicate blog views and likes.
 * Falls back to a fresh random ID when storage is unavailable.
 * @returns {string} The ID, or "" during server rendering.
 */
export function getBlogVisitorId() {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(STORAGE_KEYS.BLOG_VISITOR_ID);
    if (!id) {
      id = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : createRandomId();
      window.localStorage.setItem(STORAGE_KEYS.BLOG_VISITOR_ID, id);
    }
    return id;
  } catch {
    return createRandomId();
  }
}

/* ------------------------------------------------------------------ */
/* Cross-tab order status                                              */
/* ------------------------------------------------------------------ */

/**
 * Store an order status change so other tabs receive a `storage` event.
 * @param {{id: string, status: string, timestamp: number}} update
 */
export function saveOrderStatusUpdate(update) {
  localStorage.setItem(STORAGE_KEYS.ORDER_STATUS_UPDATE, JSON.stringify(update));
}
