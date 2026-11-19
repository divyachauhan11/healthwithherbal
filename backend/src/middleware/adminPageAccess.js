const User = require("../models/User");
const portalPageForPath = (path) => {
  const section = path.split("/").filter(Boolean)[0];
  const pages = {
    dashboard: "Dashboard", products: "Products", "low-stock": "Low Stock",
    categories: "Categories", brands: "Brands", coupons: "Coupons", payments: "Payments",
    reviews: "Reviews", orders: "Orders", "return-exchange": "Returns & Exchanges", customers: "Customers", blogs: "Blogs",
    users: "Users", settings: "Settings", profile: "Profile",
  };
  return pages[section] || null;
};
const requirePageAccess = async (req, res, next) => {
  try {
    if (req.admin.userId) {
      const staff = await User.findById(req.admin.userId)
        .select("role isActive pageAccess email")
        .lean();
      if (!staff || !staff.isActive || !["admin", "employee"].includes(staff.role)) {
        return res.status(401).json({ error: "This admin account is no longer active. Please sign in again." });
      }
      req.admin.role = staff.role;
      req.admin.email = staff.email;
      req.admin.pageAccess = staff.pageAccess || [];
    }
    const page = portalPageForPath(req.path);
    // The notification feed filters each event to the pages granted to this staff account.
    if (req.path.split("/").filter(Boolean)[0] === "notifications") return next();
    // Shared media uploads are used by profile photos and other admin forms.
    // The session is authenticated above and staff accounts have already been
    // checked for active admin/employee status.
    if (req.path.split("/").filter(Boolean)[0] === "upload") return next();
    // Every authenticated admin can manage their own profile, regardless of the
    // granular page list assigned to their account.
    if (page === "Profile") return next();
    if (page && req.admin.pageAccess?.includes(page)) return next();
    return res.status(403).json({ error: "You do not have access to this admin page." });
  } catch (error) {
    return next(error);
  }
};

module.exports = { requirePageAccess };
