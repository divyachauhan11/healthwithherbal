import { STORAGE_KEYS } from "@/constants/storage-keys";

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
