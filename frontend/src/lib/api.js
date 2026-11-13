const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "/api"
).replace(/\/$/, "");

export async function submitContactMessage(payload) {
  const response = await fetch(`${API_BASE_URL}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Could not send your message.");
  return result;
}

export async function createOrder(payload) {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(result.error || "Could not place your order.");
  return result.order;
}

export async function fetchOrderDetails(identifier) {
  if (!identifier) return null;
  const response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(identifier)}`, {
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Order not found");
  return result.order;
}

export function getOrderLiveStreamUrl(identifier) {
  if (!identifier) return "";
  return `${API_BASE_URL}/orders/${encodeURIComponent(identifier)}/live`;
}

export async function submitProductReview(payload) {
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "Could not submit your review.");
  }
  return result;
}

export async function listProducts(params = "") {
  const qs = params ? `&${params}` : "";
  const response = await fetch(`${API_BASE_URL}/products?limit=64${qs}`, {
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Could not load products.");
  return result.items || [];
}

export async function fetchStoreInit() {
  const response = await fetch(`${API_BASE_URL}/store/init`, {
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      result.error || `Could not load store database (HTTP ${response.status}).`,
    );
  }
  return result;
}

export async function listCategories() {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return [];
  return result;
}

export async function listBrands() {
  const response = await fetch(`${API_BASE_URL}/brands`, { cache: "no-store" });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return [];
  return result;
}

export async function listCoupons() {
  const response = await fetch(`${API_BASE_URL}/coupons`, {
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return [];
  return result;
}

export async function validateCoupon(code) {
  const response = await fetch(
    `${API_BASE_URL}/coupons/validate?code=${encodeURIComponent(code)}`,
    { cache: "no-store" },
  );
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Invalid coupon code.");
  return result.coupon;
}

export async function listBlogs() {
  const response = await fetch(`${API_BASE_URL}/blogs`, { cache: "no-store" });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return [];
  return result;
}

export async function getBlog(slug) {
  const response = await fetch(
    `${API_BASE_URL}/blogs/${encodeURIComponent(slug)}`,
    { cache: "no-store" },
  );
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Article not found.");
  return result;
}

export async function listReviews(productId) {
  const qs = productId ? `?productId=${encodeURIComponent(productId)}` : "";
  const response = await fetch(`${API_BASE_URL}/reviews${qs}`, {
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return [];
  return result;
}

export async function estimateShipping(payload) {
  const response = await fetch(`${API_BASE_URL}/shipping/estimate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "Could not estimate shipping.");
  }
  return result;
}

export async function syncCartWithBackend(payload) {
  const response = await fetch(`${API_BASE_URL}/cart/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "Could not sync cart.");
  }
  return result;
}

export async function fetchCartFromBackend(sessionId) {
  if (!sessionId) return { cart: null, items: [] };
  const response = await fetch(
    `${API_BASE_URL}/cart?sessionId=${encodeURIComponent(sessionId)}`,
    { cache: "no-store" },
  );
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return { cart: null, items: [] };
  return result;
}

export async function requestLoginOtp(param) {
  const payload = typeof param === "string" ? { identifier: param } : param;
  const response = await fetch(`${API_BASE_URL}/auth/login/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data.error || "Login request failed");
    err.status = response.status;
    err.notRegistered = Boolean(data.notRegistered);
    throw err;
  }
  return data;
}

export async function verifyLoginOtp({ phone, email, identifier, otp }) {
  const payload = {
    identifier: identifier || email || phone,
    phone,
    email,
    otp,
  };
  const response = await fetch(`${API_BASE_URL}/auth/login/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data.error || "Login verification failed");
    err.status = response.status;
    err.notRegistered = Boolean(data.notRegistered);
    throw err;
  }
  return { ...data.user, sessionToken: data.token };
}

export async function requestSignupOtp({ name, email, phone }) {
  const response = await fetch(`${API_BASE_URL}/auth/signup/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data.error || "Account creation request failed");
    err.status = response.status;
    throw err;
  }
  return data;
}

export async function verifySignupOtp({ name, email, phone, otp }) {
  const response = await fetch(`${API_BASE_URL}/auth/signup/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, otp }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data.error || "Failed to create account in database");
    err.status = response.status;
    throw err;
  }
  return { ...data.user, sessionToken: data.token };
}

export async function socialLogin(idToken) {
  const response = await fetch(`${API_BASE_URL}/auth/social`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: "google", idToken }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Social authentication failed");
  }
  return { ...data.user, sessionToken: data.token };
}

function userAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("hwh_session_token") : "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchUserWishlist() {
  const headers = userAuthHeaders();
  if (!headers.Authorization) return [];
  const response = await fetch(`${API_BASE_URL}/user/wishlist`, { headers, cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `Could not load your wishlist (HTTP ${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return data.items || [];
}

export async function addUserWishlistItem(productId) {
  const response = await fetch(`${API_BASE_URL}/user/wishlist`, {
    method: "POST", headers: { "Content-Type": "application/json", ...userAuthHeaders() },
    body: JSON.stringify({ productId }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not save this item.");
}

export async function removeUserWishlistItem(productId) {
  const response = await fetch(`${API_BASE_URL}/user/wishlist/${encodeURIComponent(productId)}`, {
    method: "DELETE", headers: userAuthHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not remove this item.");
}

export async function fetchUserOrders({ phone, email, userId } = {}) {
  const params = new URLSearchParams();
  if (phone) params.set("phone", phone);
  if (email) params.set("email", email);
  if (userId) params.set("userId", userId);

  const response = await fetch(
    `${API_BASE_URL}/user/orders?${params.toString()}`,
    {
      cache: "no-store",
    },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return [];
  return data.orders || [];
}

export async function fetchUserAddresses({ phone, email, userId } = {}) {
  const params = new URLSearchParams();
  if (phone) params.set("phone", phone);
  if (email) params.set("email", email);
  if (userId) params.set("userId", userId);

  const response = await fetch(
    `${API_BASE_URL}/user/addresses?${params.toString()}`,
    {
      cache: "no-store",
    },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Could not load saved addresses.");
  }
  return data.addresses || [];
}

export async function saveUserAddress(payload) {
  const response = await fetch(`${API_BASE_URL}/user/addresses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Could not save address.");
  }
  return data.address;
}

export async function updateUserAddress(id, payload) {
  const response = await fetch(`${API_BASE_URL}/user/addresses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Could not update address.");
  }
  return data.address;
}

export async function deleteUserAddress(id) {
  const response = await fetch(`${API_BASE_URL}/user/addresses/${id}`, {
    method: "DELETE",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Could not delete address.");
  }
  return data;
}
