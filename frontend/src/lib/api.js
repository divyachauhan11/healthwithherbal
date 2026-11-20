/**
 * Storefront API: one function per customer-facing endpoint, built on the
 * shared client in `lib/api-client.js`. Components call these functions
 * instead of composing routes themselves.
 *
 * Conventions:
 * - Functions resolve with the payload the UI needs (a list, a record, ...).
 * - Failures reject with `ApiError` (see `lib/api-client.js`).
 * - A few read-only catalogue/account lists resolve with an empty value when
 *   the server answers with an HTTP error, so one failing section cannot blank
 *   the storefront. They are marked "Degrades to ..." below. Network errors,
 *   timeouts and malformed responses still reject.
 * - Reads of live data use `cache: "no-store"`.
 */
import {
  API_ERROR_CODES,
  apiDelete,
  apiGet,
  apiPath,
  apiPost,
  apiPut,
  buildApiUrl,
  UPLOAD_TIMEOUT_MS,
} from "@/lib/api-client";
import { getCustomerSessionToken } from "@/lib/session";

export { getBlogVisitorId } from "@/lib/session";

const noStore = { cache: "no-store" };

/**
 * Run a request and resolve with `fallback` when the server answers with an
 * HTTP error status. Every other failure is re-thrown.
 * @template T
 * @param {() => Promise<T>} request
 * @param {T} fallback
 * @returns {Promise<T>}
 */
async function withHttpErrorFallback(request, fallback) {
  try {
    return await request();
  } catch (error) {
    if (error?.code === API_ERROR_CODES.HTTP_ERROR) return fallback;
    throw error;
  }
}

function hasCustomerSession() {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(getCustomerSessionToken());
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Store and catalogue                                                 */
/* ------------------------------------------------------------------ */

/** @returns {Promise<object>} Everything the storefront shell needs on load. */
export const fetchStoreInit = () => apiGet("/store/init", noStore);

/**
 * @param {string|Record<string, string>|URLSearchParams} [params] Extra filters
 *   (category, brand, q, sort, page) added after the default `limit=64`.
 * @returns {Promise<Array>} Matching products.
 */
export async function listProducts(params = "") {
  const query = new URLSearchParams("limit=64");
  new URLSearchParams(params).forEach((value, key) => query.append(key, value));
  const result = await apiGet("/products", { ...noStore, query });
  return result.items || [];
}

/** Degrades to `[]`. */
export const listCategories = () => withHttpErrorFallback(() => apiGet("/categories", noStore), []);

/** Degrades to `[]`. */
export const listBrands = () => withHttpErrorFallback(() => apiGet("/brands", noStore), []);

/** Degrades to `[]`. */
export const listCoupons = () => withHttpErrorFallback(() => apiGet("/coupons", noStore), []);

/**
 * @param {string} code Coupon code entered by the customer.
 * @returns {Promise<object>} The coupon when it is valid.
 */
export async function validateCoupon(code) {
  const result = await apiGet("/coupons/validate", {
    ...noStore,
    query: new URLSearchParams({ code: String(code) }),
  });
  return result.coupon;
}

/**
 * Approved reviews, optionally for one product. Degrades to `[]`.
 * @param {string|number} [productId]
 */
export const listReviews = (productId) =>
  withHttpErrorFallback(
    () => apiGet("/reviews", { ...noStore, query: productId ? { productId } : undefined }),
    [],
  );

/** Submit a product review for moderation. */
export const submitProductReview = (payload) => apiPost("/reviews", payload);

/* ------------------------------------------------------------------ */
/* Cart and shipping                                                   */
/* ------------------------------------------------------------------ */

/** @returns {Promise<object>} Shipping options and charges for the cart/address. */
export const estimateShipping = (payload) => apiPost("/shipping/estimate", payload);

/** Save the anonymous cart on the server. */
export const syncCartWithBackend = (payload) => apiPost("/cart/sync", payload);

/**
 * Degrades to an empty cart.
 * @param {string} sessionId Anonymous cart session ID.
 * @returns {Promise<{cart: object|null, items: Array}>}
 */
export async function fetchCartFromBackend(sessionId) {
  const emptyCart = { cart: null, items: [] };
  if (!sessionId) return emptyCart;
  return withHttpErrorFallback(
    () => apiGet("/cart", { ...noStore, query: { sessionId } }),
    emptyCart,
  );
}

/* ------------------------------------------------------------------ */
/* Orders, payments, returns                                           */
/* ------------------------------------------------------------------ */

/** Place a cash-on-delivery order. @returns {Promise<object>} The created order. */
export async function createOrder(payload) {
  const result = await apiPost("/orders", payload);
  return result.order;
}

/** Start a PayU hosted checkout. @returns {Promise<object>} Order and PayU form fields. */
export const createPayuCheckout = (payload) =>
  apiPost("/orders", { ...payload, paymentMethod: "payu" });

/** @returns {Promise<object>} Whether online payment is configured. */
export const fetchPayuStatus = () => apiGet("/orders/payu/status", noStore);

/**
 * @param {string} identifier Order number or ID.
 * @returns {Promise<object|null>} The order, or null without an identifier.
 */
export async function fetchOrderDetails(identifier) {
  if (!identifier) return null;
  const result = await apiGet(apiPath`/orders/${identifier}`, noStore);
  return result.order;
}

/** @returns {string} Server-sent events URL for live order status, or "". */
export function getOrderLiveStreamUrl(identifier) {
  return identifier ? buildApiUrl(apiPath`/orders/${identifier}/live`) : "";
}

/** Request a return or exchange for a delivered item. */
export const submitReturnExchangeRequest = (payload) =>
  apiPost("/orders/return-exchange", payload);

/** Email support about a return or exchange. */
export const submitReturnExchangeEmail = (payload) =>
  apiPost("/orders/return-exchange/email", payload);

/**
 * @param {FileList|File[]} files Photos of the item.
 * @returns {Promise<string[]>} Uploaded photo URLs.
 */
export async function uploadReturnExchangePhotos(files) {
  const formData = new FormData();
  Array.from(files || []).forEach((file) => formData.append("photos", file));
  const result = await apiPost("/orders/return-exchange/photos", formData, {
    timeout: UPLOAD_TIMEOUT_MS,
  });
  return result.urls || [];
}

/* ------------------------------------------------------------------ */
/* Customer authentication                                             */
/* ------------------------------------------------------------------ */

const toSessionUser = (data) => ({ ...data.user, sessionToken: data.token });

/** @param {string|{identifier: string}} param Email/phone, or a request body. */
export const requestLoginOtp = (param) =>
  apiPost("/auth/login/request-otp", typeof param === "string" ? { identifier: param } : param);

/** @returns {Promise<object>} The signed-in user including `sessionToken`. */
export async function verifyLoginOtp({ phone, email, identifier, otp }) {
  const data = await apiPost("/auth/login/verify-otp", {
    identifier: identifier || email || phone,
    phone,
    email,
    otp,
  });
  return toSessionUser(data);
}

export const requestSignupOtp = ({ name, email, phone }) =>
  apiPost("/auth/signup/request-otp", { name, email, phone });

/** @returns {Promise<object>} The new user including `sessionToken`. */
export async function verifySignupOtp({ name, email, phone, otp }) {
  const data = await apiPost("/auth/signup/verify-otp", { name, email, phone, otp });
  return toSessionUser(data);
}

/** @param {string} idToken Google ID token. @returns {Promise<object>} The signed-in user. */
export async function socialLogin(idToken) {
  const data = await apiPost("/auth/social", { provider: "google", idToken });
  return toSessionUser(data);
}

/* ------------------------------------------------------------------ */
/* Customer account                                                    */
/* ------------------------------------------------------------------ */

const customer = { auth: "customer" };

/** @returns {Promise<Array>} Wishlist items; `[]` when nobody is signed in. */
export async function fetchUserWishlist() {
  if (!hasCustomerSession()) return [];
  const data = await apiGet("/user/wishlist", { ...noStore, ...customer });
  return data.items || [];
}

export const addUserWishlistItem = (productId) =>
  apiPost("/user/wishlist", { productId }, customer);

export const removeUserWishlistItem = (productId) =>
  apiDelete(apiPath`/user/wishlist/${productId}`, customer);

const userQuery = ({ phone, email, userId } = {}) => ({ phone, email, userId });

/**
 * Degrades to `[]`.
 * @param {{phone?: string, email?: string, userId?: string}} filters
 */
export async function fetchUserOrders(filters) {
  const result = await withHttpErrorFallback(
    () => apiGet("/user/orders", { ...noStore, ...customer, query: userQuery(filters) }),
    { orders: [] },
  );
  return result.orders || [];
}

/** @param {{phone?: string, email?: string, userId?: string}} filters */
export async function fetchUserAddresses(filters) {
  const result = await apiGet("/user/addresses", {
    ...noStore,
    ...customer,
    query: userQuery(filters),
  });
  return result.addresses || [];
}

/** @returns {Promise<object>} The saved address. */
export async function saveUserAddress(payload) {
  const result = await apiPost("/user/addresses", payload, customer);
  return result.address;
}

/** @returns {Promise<object>} The updated address. */
export async function updateUserAddress(id, payload) {
  const result = await apiPut(apiPath`/user/addresses/${id}`, payload, customer);
  return result.address;
}

export const deleteUserAddress = (id) => apiDelete(apiPath`/user/addresses/${id}`, customer);

/* ------------------------------------------------------------------ */
/* Blog and contact                                                    */
/* ------------------------------------------------------------------ */

/** Degrades to `[]`. */
export const listBlogs = () => withHttpErrorFallback(() => apiGet("/blogs", noStore), []);

/** @returns {Promise<object>} A published blog post. */
export const getBlog = (slug) => apiGet(apiPath`/blogs/${slug}`, noStore);

/** @returns {Promise<object>} Likes, comments and this visitor's like state. */
export const fetchBlogCommunity = (slug, sessionId) =>
  apiGet(apiPath`/blogs/${slug}/community`, { ...noStore, query: sessionId ? { sessionId } : undefined });

export const recordBlogView = (slug, sessionId) =>
  apiPost(apiPath`/blogs/${slug}/view`, { sessionId });

/** Like (`liked: true`) or unlike a blog post for this visitor. */
export function setBlogLike(slug, sessionId, liked) {
  const path = apiPath`/blogs/${slug}/like`;
  return liked
    ? apiPost(path, { sessionId })
    : apiDelete(path, { query: new URLSearchParams({ sessionId: String(sessionId) }) });
}

export const submitBlogComment = (slug, payload) =>
  apiPost(apiPath`/blogs/${slug}/comments`, payload);

export const submitContactMessage = (payload) => apiPost("/contact", payload);
