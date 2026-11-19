import { getCustomerSessionToken } from "@/lib/session";
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  buildApiUrl,
} from "@/lib/api-client";

const noStore = { cache: "no-store" };

export function getBlogVisitorId() {
  if (typeof window === "undefined") return "";
  const key = "hwh_blog_visitor_id";
  try {
    let id = window.localStorage.getItem(key);
    if (!id) {
      id = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
  }
}

export function fetchBlogCommunity(slug, sessionId) {
  const query = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : "";
  return apiGet(`/blogs/${encodeURIComponent(slug)}/community${query}`, noStore);
}

export function recordBlogView(slug, sessionId) {
  return apiPost(`/blogs/${encodeURIComponent(slug)}/view`, { sessionId });
}

export function setBlogLike(slug, sessionId, liked) {
  const path = `/blogs/${encodeURIComponent(slug)}/like`;
  return liked
    ? apiPost(path, { sessionId })
    : apiDelete(`${path}?sessionId=${encodeURIComponent(sessionId)}`);
}

export function submitBlogComment(slug, payload) {
  return apiPost(`/blogs/${encodeURIComponent(slug)}/comments`, payload);
}

export const submitContactMessage = (payload) => apiPost("/contact", payload);

export async function createOrder(payload) {
  const result = await apiPost("/orders", payload);
  return result.order;
}

export const submitReturnExchangeRequest = (payload) =>
  apiPost("/orders/return-exchange", payload);

export const submitReturnExchangeEmail = (payload) =>
  apiPost("/orders/return-exchange/email", payload);

export async function uploadReturnExchangePhotos(files) {
  const formData = new FormData();
  Array.from(files || []).forEach((file) => formData.append("photos", file));
  const result = await apiPost("/orders/return-exchange/photos", formData);
  return result.urls || [];
}

export async function fetchOrderDetails(identifier) {
  if (!identifier) return null;
  const result = await apiGet(
    `/orders/${encodeURIComponent(identifier)}`,
    noStore,
  );
  return result.order;
}

export function getOrderLiveStreamUrl(identifier) {
  return identifier
    ? buildApiUrl(`/orders/${encodeURIComponent(identifier)}/live`)
    : "";
}

export const submitProductReview = (payload) => apiPost("/reviews", payload);

export async function listProducts(params = "") {
  const query = new URLSearchParams("limit=64");
  new URLSearchParams(params).forEach((value, key) => query.append(key, value));
  const result = await apiGet(`/products?${query}`, noStore);
  return result.items || [];
}

export const fetchStoreInit = () => apiGet("/store/init", noStore);

// These catalogue endpoints intentionally degrade to empty collections when unavailable.
async function getListOrEmpty(path) {
  try {
    return await apiGet(path, noStore);
  } catch (error) {
    if (error.code === "HTTP_ERROR") return [];
    throw error;
  }
}
export const listCategories = () => getListOrEmpty("/categories");
export const listBrands = () => getListOrEmpty("/brands");
export const listCoupons = () => getListOrEmpty("/coupons");

export async function validateCoupon(code) {
  const result = await apiGet(
    `/coupons/validate?code=${encodeURIComponent(code)}`,
    noStore,
  );
  return result.coupon;
}

export const listBlogs = () => getListOrEmpty("/blogs");
export const getBlog = (slug) =>
  apiGet(`/blogs/${encodeURIComponent(slug)}`, noStore);

export async function listReviews(productId) {
  const query = productId ? `?productId=${encodeURIComponent(productId)}` : "";
  return getListOrEmpty(`/reviews${query}`);
}

export const estimateShipping = (payload) =>
  apiPost("/shipping/estimate", payload);
export const syncCartWithBackend = (payload) => apiPost("/cart/sync", payload);

export async function fetchCartFromBackend(sessionId) {
  if (!sessionId) return { cart: null, items: [] };
  try {
    return await apiGet(
      `/cart?sessionId=${encodeURIComponent(sessionId)}`,
      noStore,
    );
  } catch (error) {
    if (error.code === "HTTP_ERROR") return { cart: null, items: [] };
    throw error;
  }
}

export async function requestLoginOtp(param) {
  return apiPost(
    "/auth/login/request-otp",
    typeof param === "string" ? { identifier: param } : param,
  );
}

export async function verifyLoginOtp({ phone, email, identifier, otp }) {
  const data = await apiPost("/auth/login/verify-otp", {
    identifier: identifier || email || phone,
    phone,
    email,
    otp,
  });
  return { ...data.user, sessionToken: data.token };
}

export const requestSignupOtp = ({ name, email, phone }) =>
  apiPost("/auth/signup/request-otp", { name, email, phone });

export async function verifySignupOtp({ name, email, phone, otp }) {
  const data = await apiPost("/auth/signup/verify-otp", {
    name,
    email,
    phone,
    otp,
  });
  return { ...data.user, sessionToken: data.token };
}

export async function socialLogin(idToken) {
  const data = await apiPost("/auth/social", { provider: "google", idToken });
  return { ...data.user, sessionToken: data.token };
}

function userAuthHeaders() {
  const token =
    typeof window !== "undefined"
      ? getCustomerSessionToken()
      : "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchUserWishlist() {
  const headers = userAuthHeaders();
  if (!headers.Authorization) return [];
  const data = await apiGet("/user/wishlist", { ...noStore, headers });
  return data.items || [];
}

export const addUserWishlistItem = (productId) =>
  apiPost("/user/wishlist", { productId }, { headers: userAuthHeaders() });
export const removeUserWishlistItem = (productId) =>
  apiDelete(`/user/wishlist/${encodeURIComponent(productId)}`, {
    headers: userAuthHeaders(),
  });

function userQuery({ phone, email, userId } = {}) {
  const params = new URLSearchParams();
  if (phone) params.set("phone", phone);
  if (email) params.set("email", email);
  if (userId) params.set("userId", userId);
  return params.toString();
}

export async function fetchUserOrders(filters) {
  try {
    const result = await apiGet(`/user/orders?${userQuery(filters)}`, noStore);
    return result.orders || [];
  } catch (error) {
    if (error.code === "HTTP_ERROR") return [];
    throw error;
  }
}

export async function fetchUserAddresses(filters) {
  const result = await apiGet(`/user/addresses?${userQuery(filters)}`, noStore);
  return result.addresses || [];
}

export async function saveUserAddress(payload) {
  const result = await apiPost("/user/addresses", payload);
  return result.address;
}

export async function updateUserAddress(id, payload) {
  const result = await apiPut(
    `/user/addresses/${encodeURIComponent(id)}`,
    payload,
  );
  return result.address;
}

export const deleteUserAddress = (id) =>
  apiDelete(`/user/addresses/${encodeURIComponent(id)}`);
