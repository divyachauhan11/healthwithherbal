import { ADMIN_PAGE_IDS, ADMIN_PAGE_LIST } from "@/constants/admin-pages";

/** Pages granted to new employee accounts, in display order. */
export const EMPLOYEE_DEFAULT_PAGES = Object.freeze([
  ADMIN_PAGE_IDS.PRODUCTS,
  ADMIN_PAGE_IDS.CATEGORIES,
  ADMIN_PAGE_IDS.BRANDS,
  ADMIN_PAGE_IDS.COUPONS,
  ADMIN_PAGE_IDS.REVIEWS,
  ADMIN_PAGE_IDS.ORDERS,
  ADMIN_PAGE_IDS.PAYMENTS,
  ADMIN_PAGE_IDS.RETURNS_EXCHANGES,
  ADMIN_PAGE_IDS.CUSTOMERS,
  ADMIN_PAGE_IDS.BLOGS,
  ADMIN_PAGE_IDS.PROFILE,
]);

/**
 * Page access granted by default to a role: every page for admins, the employee set otherwise.
 * @param {string} role
 * @returns {string[]}
 */
export const getDefaultPageAccess = (role) =>
  role === "admin" ? [...ADMIN_PAGE_LIST] : [...EMPLOYEE_DEFAULT_PAGES];

/** Whether a page is always granted (employees always keep their profile page). */
export const isLockedPage = (pageName, role) =>
  pageName === ADMIN_PAGE_IDS.PROFILE && role === "employee";

/**
 * Empty form for creating a staff account (an active employee with the default pages).
 * @returns {object}
 */
export const createUserForm = () => ({
  name: "",
  email: "",
  role: "employee",
  isActive: true,
  pageAccess: [...EMPLOYEE_DEFAULT_PAGES],
  password: "",
  confirmPassword: "",
});

/**
 * Form values for editing an existing staff account (passwords left blank).
 * @param {object} user
 * @returns {object}
 */
export const userToForm = (user) => ({
  name: user.name || "",
  email: user.email || "",
  role: user.role || "employee",
  isActive: user.isActive !== false,
  pageAccess: user.role === "employee"
    ? [...new Set([...(user.pageAccess || EMPLOYEE_DEFAULT_PAGES), ADMIN_PAGE_IDS.PROFILE])]
    : user.pageAccess || [...ADMIN_PAGE_LIST],
  password: "",
  confirmPassword: "",
});

/**
 * Account data to send for a form: everything except the confirmation, and without an
 * empty password when editing.
 * @param {object} form
 * @param {boolean} isEditing
 * @returns {object}
 */
export const toUserPayload = (form, isEditing) => {
  const userData = { ...form };
  delete userData.confirmPassword;
  if (isEditing && !userData.password) delete userData.password;
  return userData;
};
