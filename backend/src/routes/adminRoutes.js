const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const registerAdminAuthRoutes = require("./adminAuthRoutes");
const Product = require("../models/Product");
const ProductCategory = require("../models/ProductCategory");
const InventoryLog = require("../models/InventoryLog");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const Coupon = require("../models/Coupon");
const ProductReview = require("../models/ProductReview");
const BlogPost = require("../models/BlogPost");
const User = require("../models/User");
const { syncProductRating } = require("../utils/syncRatings");

const router = express.Router();
const registerAdminCatalogRoutes = require("./adminCatalogRoutes");
const registerAdminOrderRoutes = require("./adminOrderRoutes");
const registerAdminProductRoutes = require("./adminProductRoutes");
const registerAdminReviewRoutes = require("./adminReviewRoutes");
const registerAdminBlogRoutes = require("./adminBlogRoutes");
const registerAdminStaffRoutes = require("./adminStaffRoutes");
const registerAdminSettingsRoutes = require("./adminSettingsRoutes");
const registerAdminDashboardRoutes = require("./adminDashboardRoutes");
const registerAdminCustomerRoutes = require("./adminCustomerRoutes");

const {
  adminPortalPages,
  loginSchema,
  productSchema,
  categorySchema,
  brandSchema,
  couponSchema,
  orderStatusSchema,
  blogSchema,
  staffUserSchema,
  staffUserUpdateSchema,
  slugify,
  validId,
  invalid,
} = require("./adminSchemas");
registerAdminAuthRoutes({
  router,
  asyncHandler,
  loginSchema,
  adminPortalPages,
  invalid,
  User,
});

registerAdminSettingsRoutes({
  router,
  asyncHandler,
  Category,
});
registerAdminDashboardRoutes({
  router,
  asyncHandler,
  Product,
  Order,
  ProductReview,
});
registerAdminProductRoutes({
  router,
  asyncHandler,
  validId,
  Product,
  Category,
  ProductCategory,
  InventoryLog,
  productSchema,
  invalid,
  Brand,
  slugify,
});
registerAdminOrderRoutes({
  router,
  asyncHandler,
  Order,
  OrderItem,
  Product,
  InventoryLog,
  orderStatusSchema,
  validId,
  invalid,
});
registerAdminCatalogRoutes({
  router,
  asyncHandler,
  Category,
  ProductCategory,
  Product,
  Brand,
  Coupon,
  categorySchema,
  brandSchema,
  couponSchema,
  invalid,
  slugify,
  validId,
});
registerAdminReviewRoutes({
  router,
  asyncHandler,
  ProductReview,
  validId,
  invalid,
  syncProductRating,
});
registerAdminCustomerRoutes({
  router,
  asyncHandler,
  Order,
});
registerAdminBlogRoutes({
  router,
  asyncHandler,
  BlogPost,
  blogSchema,
  invalid,
  User,
  slugify,
});
registerAdminStaffRoutes({
  router,
  asyncHandler,
  User,
  staffUserSchema,
  staffUserUpdateSchema,
  validId,
  invalid,
});
module.exports = router;
