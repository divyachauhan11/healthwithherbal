const USER_ROLES = Object.freeze({
  ADMIN: "admin",
  EMPLOYEE: "employee",
  CUSTOMER: "customer",
});

const ADMIN_ROLES = Object.freeze([USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]);

module.exports = { USER_ROLES, ADMIN_ROLES };
