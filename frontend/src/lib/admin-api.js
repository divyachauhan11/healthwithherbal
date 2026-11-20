/**
 * Admin portal API: one function per admin endpoint, built on the shared
 * client in `lib/api-client.js`. Components call these functions instead of
 * composing routes themselves.
 *
 * Conventions:
 * - Requests go to `/api/admin/...` with `cache: "no-store"`.
 * - `token` is optional: pass the portal's in-memory token, or omit it to use
 *   the stored admin session.
 * - A 401 clears the stored admin session and dispatches
 *   {@link ADMIN_SESSION_INVALID_EVENT}; the portal listens for it and returns
 *   to the sign-in screen. Every failure still rejects with `ApiError`.
 */
import { apiPath, apiPost, apiRequest } from "@/lib/api-client";
import { clearAdminSession } from "@/lib/session";
import { ADMIN_PAGE_IDS } from "@/constants/admin-pages";

/** Window event dispatched when the server rejects the admin session (HTTP 401). */
export const ADMIN_SESSION_INVALID_EVENT = "hwh-admin-session-invalid";

function handleAdminUnauthorized(error) {
  if (error?.status !== 401 || typeof window === "undefined") return;
  try {
    clearAdminSession();
  } catch {
    // The in-memory session is cleared by the admin portal event listener.
  }
  window.dispatchEvent(new CustomEvent(ADMIN_SESSION_INVALID_EVENT, {
    detail: { message: error.message },
  }));
}

/**
 * Low-level admin request. Prefer the named endpoint functions below.
 * @param {string} path Path below `/api/admin`, e.g. "/products".
 * @param {object} [options]
 * @param {string} [options.token] Admin bearer token; defaults to the stored session.
 * @param {string} [options.method="GET"]
 * @param {*} [options.body]
 * @param {Record<string, unknown>} [options.query]
 * @param {boolean} [options.useStoredSession=true] Fall back to the stored token.
 * @returns {Promise<*>} Parsed response body.
 */
export async function adminRequest(
  path,
  { token, method = "GET", body, query, useStoredSession = true, timeout } = {},
) {
  try {
    return await apiRequest(`/admin${path}`, {
      method,
      body,
      query,
      timeout,
      cache: "no-store",
      token,
      auth: useStoredSession ? "admin" : undefined,
    });
  } catch (error) {
    handleAdminUnauthorized(error);
    throw error;
  }
}

/**
 * Whether a failed admin request means the user must sign in again.
 * @param {unknown} error
 * @returns {boolean}
 */
export function isAdminSessionError(error) {
  const message = String(error?.message || "").toLowerCase();
  return error?.status === 401 || message.includes("session") || message.includes("sign in");
}

/* ------------------------------------------------------------------ */
/* Authentication                                                      */
/* ------------------------------------------------------------------ */

/**
 * @param {{email: string, password: string}} credentials
 * @returns {Promise<{token: string, user: object}>}
 */
export const loginAdmin = ({ email, password }) =>
  adminRequest("/auth/login", {
    method: "POST",
    body: { email, password },
    useStoredSession: false,
  });

/** @returns {Promise<{user: object}>} The current admin's verified profile and access. */
export const fetchAdminSession = (token) => adminRequest("/auth/session", { token });

/** Send a password-reset email (always resolves the same way to prevent account probing). */
export const requestAdminPasswordReset = (email) =>
  apiPost("/admin/auth/forgot-password", { email });

/** @param {{email: string, token: string, password: string}} payload */
export const resetAdminPassword = ({ email, token, password }) =>
  apiPost("/admin/auth/reset-password", { email, token, password });

/* ------------------------------------------------------------------ */
/* Portal data                                                         */
/* ------------------------------------------------------------------ */

const ADMIN_PAGE_ROUTES = Object.freeze({
  [ADMIN_PAGE_IDS.DASHBOARD]: "/dashboard",
  [ADMIN_PAGE_IDS.LOW_STOCK]: "/low-stock",
  [ADMIN_PAGE_IDS.RETURNS_EXCHANGES]: "/return-exchange",
});

/**
 * Load the data shown on an admin portal page.
 * @param {string} pageId One of `ADMIN_PAGE_IDS`.
 * @param {{token?: string, parentCategoryId?: string}} [options]
 * @returns {Promise<object|Array>} The stats payload for pages that have one
 *   (dashboard), otherwise the page's list of items.
 */
export async function fetchAdminPageData(pageId, { token, parentCategoryId } = {}) {
  const route = ADMIN_PAGE_ROUTES[pageId] || `/${pageId.toLowerCase()}`;
  const query =
    pageId === ADMIN_PAGE_IDS.PRODUCTS && parentCategoryId ? { parentCategoryId } : undefined;
  const result = await adminRequest(route, { token, query });
  return result.stats ? result : result.items || [];
}

/** @returns {Promise<{brands: Array, categories: Array}>} Catalog lookups for product forms. */
export async function fetchAdminCatalog(token) {
  const [brands, categories] = await Promise.all([
    adminRequest("/brands", { token }),
    adminRequest("/categories", { token }),
  ]);
  return { brands: brands.items || [], categories: categories.items || [] };
}

/** @returns {Promise<object>} Dashboard statistics. */
export const fetchAdminDashboard = (token) => adminRequest("/dashboard", { token });

/** @returns {Promise<Array>} Current admin notifications. */
export async function fetchAdminNotifications(token) {
  const result = await adminRequest("/notifications", { token });
  return Array.isArray(result.items) ? result.items : [];
}

/* ------------------------------------------------------------------ */
/* Generic records (products, categories, brands, coupons, blogs, ...) */
/* ------------------------------------------------------------------ */

/**
 * Create (no `id`) or update (with `id`) a record of an admin resource.
 * @param {string} kind Resource collection, e.g. "products", "coupons".
 * @param {string|undefined} id Record ID for updates.
 * @param {object} body Record fields.
 * @param {string} [token]
 */
export const saveAdminRecord = (kind, id, body, token) =>
  adminRequest(`/${kind}${id ? apiPath`/${id}` : ""}`, {
    token,
    method: id ? "PUT" : "POST",
    body,
  });

/** Delete a record of an admin resource. */
export const deleteAdminRecord = (kind, id, token) =>
  adminRequest(`/${kind}${apiPath`/${id}`}`, { token, method: "DELETE" });

/* ------------------------------------------------------------------ */
/* Products and inventory                                              */
/* ------------------------------------------------------------------ */

/** Show (`active: true`) or hide a product in the storefront. */
export const setAdminProductActive = (productId, active, token) =>
  adminRequest(apiPath`/products/${productId}/toggle-active`, {
    token,
    method: "PATCH",
    body: { active },
  });

/** Set a product's stock level, recording the reason in the inventory log. */
export const updateAdminProductStock = (productId, { stockQty, reason }, token) =>
  adminRequest(apiPath`/products/${productId}/stock`, {
    token,
    method: "PATCH",
    body: { stockQty, reason },
  });

/**
 * Upload product, brand or profile images.
 * @param {File|File[]|FileList|FormData} files
 * @param {{token?: string}} [options]
 * @returns {Promise<{urls: string[]}>}
 */
export async function adminUploadRequest(files, { token } = {}) {
  const isFormData = typeof FormData !== "undefined" && files instanceof FormData;
  const formData = isFormData ? files : new FormData();

  if (!isFormData) {
    if (Array.isArray(files)) files.forEach((file) => formData.append("images", file));
    else if (typeof FileList !== "undefined" && files instanceof FileList) {
      Array.from(files).forEach((file) => formData.append("images", file));
    } else if (files) formData.append("images", files);
  }

  return adminRequest("/upload", { token, method: "POST", body: formData });
}

/* ------------------------------------------------------------------ */
/* Orders, payments, returns, reviews                                  */
/* ------------------------------------------------------------------ */

/** Change an order's fulfilment status. */
export const updateAdminOrderStatus = (orderId, status, token) =>
  adminRequest(apiPath`/orders/${orderId}`, { token, method: "PATCH", body: { status } });

/** Update a payment record (status, method, reference). */
export const updateAdminPayment = (paymentId, body, token) =>
  adminRequest(apiPath`/payments/${paymentId}`, { token, method: "PATCH", body });

/** Update a return/exchange request (status, note and refund details). */
export const updateAdminReturnRequest = (requestId, body, token) =>
  adminRequest(apiPath`/return-exchange/${requestId}`, { token, method: "PATCH", body });

/** Moderate a product review. */
export const updateAdminReview = (reviewId, body, token) =>
  adminRequest(apiPath`/reviews/${reviewId}`, { token, method: "PATCH", body });

/** Delete a product review. */
export const deleteAdminReview = (reviewId, token) =>
  adminRequest(apiPath`/reviews/${reviewId}`, { token, method: "DELETE" });

/* ------------------------------------------------------------------ */
/* Customers and staff                                                 */
/* ------------------------------------------------------------------ */

/** @returns {Promise<object>} A customer's profile, orders and activity. */
export const fetchAdminCustomerDetail = (email, token) =>
  adminRequest(apiPath`/customers/detail/${email}`, { token });

/** Enable or disable a customer account. */
export const setAdminCustomerActive = (email, isActive, token) =>
  adminRequest(apiPath`/customers/${email}/status`, {
    token,
    method: "PATCH",
    body: { isActive },
  });

/** Create a staff (admin/employee) account. */
export const createAdminUser = (body, token) =>
  adminRequest("/users", { token, method: "POST", body });

/** Update a staff account. */
export const updateAdminUser = (userId, body, token) =>
  adminRequest(apiPath`/users/${userId}`, { token, method: "PUT", body });

/* ------------------------------------------------------------------ */
/* Blog comments                                                       */
/* ------------------------------------------------------------------ */

/** @returns {Promise<object>} Comments for a blog post. */
export const fetchAdminBlogComments = (blogId, token) =>
  adminRequest(apiPath`/blogs/${blogId}/comments`, { token });

/** Change a blog comment's moderation status. */
export const updateAdminBlogCommentStatus = (blogId, commentId, status, token) =>
  adminRequest(apiPath`/blogs/${blogId}/comments/${commentId}`, {
    token,
    method: "PATCH",
    body: { status },
  });

/** Delete a blog comment. */
export const deleteAdminBlogComment = (blogId, commentId, token) =>
  adminRequest(apiPath`/blogs/${blogId}/comments/${commentId}`, { token, method: "DELETE" });

/* ------------------------------------------------------------------ */
/* Store settings and profile                                          */
/* ------------------------------------------------------------------ */

/** @returns {Promise<object>} Whether customers can request returns/exchanges. */
export const fetchAdminReturnExchangeSetting = (token) =>
  adminRequest("/settings/return-exchange", { token });

/** Enable or disable customer return/exchange requests. */
export const saveAdminReturnExchangeSetting = (enabled, token) =>
  adminRequest("/settings/return-exchange", { token, method: "PUT", body: { enabled } });

/** @returns {Promise<{announcements: string[]}>} Storefront announcement bar messages. */
export const fetchAdminAnnouncements = (token) => adminRequest("/settings/announcements", { token });

/** Replace the storefront announcement bar messages. */
export const saveAdminAnnouncements = (body, token) =>
  adminRequest("/settings/announcements", { token, method: "PUT", body });

/** @returns {Promise<object>} Parent categories featured on the home page. */
export const fetchAdminFeaturedCategories = (token) =>
  adminRequest("/settings/featured-categories", { token });

/** Choose the parent categories featured on the home page. */
export const saveAdminFeaturedCategories = (body, token) =>
  adminRequest("/settings/featured-categories", { token, method: "PUT", body });

/** @returns {Promise<{user: object}>} The signed-in admin's profile. */
export const fetchAdminProfile = (token) => adminRequest("/profile", { token });

/** Update the signed-in admin's profile. */
export const updateAdminProfile = (body, token) =>
  adminRequest("/profile", { token, method: "PATCH", body });
