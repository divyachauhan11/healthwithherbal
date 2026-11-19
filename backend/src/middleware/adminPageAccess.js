const { ADMIN_ROLES } = require("../constants/roles");
const { ADMIN_PAGE_BY_PATH } = require("../constants/pages");
const portalPageForPath = (path) => {
  const section = path.split("/").filter(Boolean)[0];
  return ADMIN_PAGE_BY_PATH[section] || null;
};
const requirePageAccess = async (req, res, next) => {
  try {
    if (req.admin.userId) {
      if (!req.admin.isActive || !ADMIN_ROLES.includes(req.admin.role)) {
        return res.status(401).json({ error: "This admin account is no longer active. Please sign in again." });
      }
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
