const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const registerAdminAuthRoutes = require("./adminAuthRoutes");
const Product = require("../models/Product");
const ProductCategory = require("../models/ProductCategory");
const InventoryLog = require("../models/InventoryLog");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Payment = require("../models/Payment");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const Coupon = require("../models/Coupon");
const ProductReview = require("../models/ProductReview");
const BlogPost = require("../models/BlogPost");
const BlogComment = require("../models/BlogComment");
const BlogLike = require("../models/BlogLike");
const BlogView = require("../models/BlogView");
const User = require("../models/User");
const Address = require("../models/Address");
const ReturnExchangeRequest = require("../models/ReturnExchangeRequest");
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
const registerAdminProfileRoutes = require("./adminProfileRoutes");
const registerAdminReturnExchangeRoutes = require("./adminReturnExchangeRoutes");

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
  Payment,
  ReturnExchangeRequest,
  BlogComment,
  ProductReview,
  User,
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
registerAdminReturnExchangeRoutes({ router, asyncHandler, Request: ReturnExchangeRequest, Order, Payment, validId });
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
  User,
  Payment,
  Address,
  validId,
});
registerAdminBlogRoutes({
  router,
  asyncHandler,
  BlogPost,
  BlogComment,
  BlogLike,
  BlogView,
  blogSchema,
  invalid,
  validId,
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
registerAdminProfileRoutes({ router, asyncHandler, User });
module.exports = router;
