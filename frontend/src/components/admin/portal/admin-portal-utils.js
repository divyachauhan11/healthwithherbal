import { API_ERROR_CODES } from "../../../lib/api-client";
import {
  ADMIN_PAGE_DESCRIPTIONS,
  ADMIN_PAGE_IDS,
  ADMIN_PAGE_LIST,
} from "../../../constants/admin-pages";
import { RETURN_EXCHANGE_STATUSES } from "../../../constants/statuses";
import { clearAdminSession } from "../../../lib/session";

/**
 * URL slug of an admin page name, e.g. "Returns & Exchanges" -> "returns-and-exchanges".
 * @param {string} value
 * @returns {string}
 */
export const normalizePageKey = (value) => String(value || "")
  .toLowerCase()
  .replace(/\s*&\s*/g, "-and-")
  .replace(/\s+/g, "-")
  .replace(/-+/g, "-");

/**
 * Resolve a page name or slug to a known admin page name.
 * @param {*} candidate
 * @returns {string|null}
 */
export const getValidPageName = (candidate) => {
  if (!candidate || typeof candidate !== "string") return null;
  const match = ADMIN_PAGE_LIST.find(
    (p) => normalizePageKey(p) === normalizePageKey(candidate),
  );
  return match || null;
};

/**
 * User-facing message for a failed admin sign-in.
 * @param {Error & {status?: number, code?: string}} error
 * @returns {string}
 */
export const getLoginErrorMessage = (error) => {
  if (error?.status === 401) return error.message || "Email or password is incorrect, or this account is disabled.";
  if (error?.status === 429) return "Too many sign-in attempts. Wait a few minutes, then try again.";
  if (error?.status === 503) return error.message || "Admin sign-in is temporarily unavailable. Check the server configuration.";
  if (error?.status >= 500) {
    return error.message && error.message !== "An unexpected server error occurred."
      ? error.message
      : "The sign-in service had a problem. Please try again in a moment.";
  }
  if (error?.code === API_ERROR_CODES.INVALID_JSON) return "The sign-in service returned an unexpected response. Please try again or contact your administrator.";
  if (error?.code === API_ERROR_CODES.TIMEOUT) return error.message;
  if (error?.code === API_ERROR_CODES.NETWORK_ERROR || error instanceof TypeError || /fetch failed|failed to fetch|network|load failed|connection/i.test(error?.message || "")) {
    return "Could not reach the sign-in service. Check your connection and try again.";
  }
  return error?.message || "Could not sign in. Please check your details and try again.";
};

/** Remove the stored admin token and profile, ignoring unavailable storage. */
export const clearStoredAdminSession = () => {
  try {
    clearAdminSession();
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
};

/**
 * Whether the signed-in staff member may open a page (root admins and users
 * without a page list see everything; Profile is always allowed).
 * @param {object|null} user
 * @param {string} page
 * @returns {boolean}
 */
export const canViewAdminPage = (user, page) => {
  const isRootAdmin = user?.role === "admin" && !user?._id;
  return page === ADMIN_PAGE_IDS.PROFILE
    || isRootAdmin
    || !Array.isArray(user?.pageAccess)
    || user.pageAccess.includes(page);
};

/**
 * Sidebar pages for a staff member: undefined (all) for root admins and users
 * without a page list, otherwise their pages plus Profile for employees.
 * @param {object|null} user
 * @returns {string[]|undefined}
 */
export const getAllowedAdminPages = (user) => (Array.isArray(user?.pageAccess)
  ? user.role === "admin" && !user?._id
    ? undefined
    : [...new Set([...user.pageAccess, ...(user.role === "employee" ? [ADMIN_PAGE_IDS.PROFILE] : [])])]
  : undefined);

/**
 * Number of loaded return/exchange requests still awaiting review.
 * @param {object} data Loaded admin data keyed by page name.
 * @returns {number}
 */
export const countPendingReturns = (data) =>
  (data[ADMIN_PAGE_IDS.RETURNS_EXCHANGES] || []).filter((request) => request.status === RETURN_EXCHANGE_STATUSES[0]).length;

/**
 * Description shown under the page title.
 * @param {string} page
 * @returns {string}
 */
export const getAdminPageDescription = (page) =>
  ADMIN_PAGE_DESCRIPTIONS[page] ||
  `Manage ${page.toLowerCase()} for HealthwithHerbal.`;

/**
 * Whether the page shows the shared stats row (dashboard, low stock and
 * returns render their own).
 * @param {string} page
 * @returns {boolean}
 */
export const hasPageStats = (page) =>
  page !== ADMIN_PAGE_IDS.DASHBOARD && page !== ADMIN_PAGE_IDS.LOW_STOCK && page !== ADMIN_PAGE_IDS.RETURNS_EXCHANGES;

/**
 * Loaded list for a page, or an empty list when it has none.
 * @param {object} data Loaded admin data keyed by page name.
 * @param {string} page
 * @returns {Array}
 */
export const getPageRows = (data, page) => (Array.isArray(data[page]) ? data[page] : []);

/**
 * Rows of the current page matching the search query ("hidden"/"active" filter
 * categories by visibility; otherwise any field may match).
 * @param {object} data Loaded admin data keyed by page name.
 * @param {string} page
 * @param {string} query
 * @returns {Array}
 */
export function filterAdminRows(data, page, query) {
  const rows = Array.isArray(data[page]) ? data[page] : [];
  const needle = query.trim().toLowerCase();
  if (!needle) return rows;
  if (page === ADMIN_PAGE_IDS.CATEGORIES && needle === "hidden") {
    return rows.filter((row) => row.isActive === false);
  }
  if (page === ADMIN_PAGE_IDS.CATEGORIES && needle === "active") {
    return rows.filter((row) => row.isActive !== false);
  }
  return rows.filter((row) =>
    JSON.stringify(row).toLowerCase().includes(needle),
  );
}

/**
 * State of the closed delete dialog (a new object each call).
 * @returns {{isOpen: false, kind: string, item: null, isBlocked: false, blockedCount: number, busy: false}}
 */
export const createClosedDeleteModal = () => ({
  isOpen: false,
  kind: "",
  item: null,
  isBlocked: false,
  blockedCount: 0,
  busy: false,
});
