const User = require("../models/User");
const portalPageForPath = (path) => {
  const section = path.split("/").filter(Boolean)[0];
  const pages = {
    dashboard: "Dashboard", products: "Products", "low-stock": "Low Stock",
    categories: "Categories", brands: "Brands", coupons: "Coupons",
    reviews: "Reviews", orders: "Orders", customers: "Customers", blogs: "Blogs",
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
    // Legacy root-admin sessions have no explicit page list and retain full access.
    if (req.admin.role === "admin" && req.admin.pageAccess === null) return next();
    const page = portalPageForPath(req.path);
    if (page && req.admin.pageAccess?.includes(page)) return next();
    return res.status(403).json({ error: "You do not have access to this admin page." });
  } catch (error) {
    return next(error);
  }
};

module.exports = { requirePageAccess };
