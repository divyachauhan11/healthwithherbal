/**
 * Admin page identifiers are currently the same strings as their labels.
 * Keep these values identical because they are used in navigation, URL state,
 * page access, and admin API data keys.
 */
export const ADMIN_PAGE_IDS = Object.freeze({
  DASHBOARD: "Dashboard",
  PRODUCTS: "Products",
  LOW_STOCK: "Low Stock",
  CATEGORIES: "Categories",
  BRANDS: "Brands",
  ORDERS: "Orders",
  PAYMENTS: "Payments",
  RETURNS_EXCHANGES: "Returns & Exchanges",
  COUPONS: "Coupons",
  REVIEWS: "Reviews",
  CUSTOMERS: "Customers",
  BLOGS: "Blogs",
  USERS: "Users",
  SETTINGS: "Settings",
  PROFILE: "Profile",
});

export const ADMIN_PAGE_LABELS = ADMIN_PAGE_IDS;

export const ADMIN_PAGE_LIST = Object.freeze(Object.values(ADMIN_PAGE_IDS));

export const ADMIN_PAGE_DESCRIPTIONS = Object.freeze({
  [ADMIN_PAGE_IDS.DASHBOARD]: "Here’s what’s happening with your store today.",
  [ADMIN_PAGE_IDS.PRODUCTS]: "Manage inventory, pricing and product visibility.",
  [ADMIN_PAGE_IDS.LOW_STOCK]:
    "Monitor, restock, and manage products with inventory below 10 units.",
  [ADMIN_PAGE_IDS.ORDERS]: "Track, fulfil and manage customer orders.",
  [ADMIN_PAGE_IDS.PAYMENTS]:
    "Review payment collection, transactions and refunds.",
  [ADMIN_PAGE_IDS.RETURNS_EXCHANGES]:
    "Review and resolve customer return and exchange requests.",
  [ADMIN_PAGE_IDS.CUSTOMERS]:
    "Understand customer activity and purchase history.",
});
