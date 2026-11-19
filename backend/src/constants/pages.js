const ADMIN_PAGE_BY_PATH = Object.freeze({
  dashboard: "Dashboard",
  products: "Products",
  "low-stock": "Low Stock",
  categories: "Categories",
  brands: "Brands",
  orders: "Orders",
  payments: "Payments",
  coupons: "Coupons",
  reviews: "Reviews",
  "return-exchange": "Returns & Exchanges",
  customers: "Customers",
  blogs: "Blogs",
  users: "Users",
  settings: "Settings",
  profile: "Profile",
});

const ADMIN_PORTAL_PAGES = Object.freeze(
  Object.values(ADMIN_PAGE_BY_PATH),
);

module.exports = { ADMIN_PAGE_BY_PATH, ADMIN_PORTAL_PAGES };
