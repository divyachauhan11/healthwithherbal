const mongoose = require("mongoose");
const { z } = require("zod");
const { ADMIN_PORTAL_PAGES } = require("../constants/pages");
const { ADMIN_ROLES } = require("../constants/roles");
const {
  ORDER_STATUSES,
  BLOG_POST_STATUSES,
  DISCOUNT_TYPES,
} = require("../constants/statuses");
const adminPortalPages = ADMIN_PORTAL_PAGES;
const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
});
const productSchema = z.object({
  title: z.string().trim().min(2).max(180),
  sku: z.string().trim().min(2).max(80),
  brand: z.string().trim().min(1).max(100),
  category: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(5000),
  original: z.coerce.number().min(0),
  price: z.coerce.number().min(0),
  stockQty: z.coerce.number().int().min(0),
  image: z.string().optional().default(""),
  images: z.array(z.string()).max(9, "A product can have at most 9 images.").optional().default([]),
  badge: z.string().trim().max(80).optional().nullable(),
  active: z.coerce.boolean().optional(),
});
const categorySchema = z.object({
  parentId: z.string().trim().optional().nullable(),
  isParent: z.coerce.boolean().optional().default(false),
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(120),
  type: z.string().optional().default("concern"),
  isActive: z.coerce.boolean().optional(),
});
const brandSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(120),
  description: z.string().max(1000).optional().default(""),
  logoUrl: z.string().optional().default(""),
  image: z.string().optional().default(""),
  images: z.array(z.string()).optional().default([]),
  isActive: z.coerce.boolean().optional().default(true),
});
const couponSchema = z.object({
  code: z.string().trim().min(3).max(40),
  description: z.string().max(500).optional().default(""),
  discountType: z.enum(DISCOUNT_TYPES),
  discountValue: z.coerce.number().min(0),
  minOrderAmount: z.coerce.number().min(0).optional().default(0),
  usageLimit: z.coerce.number().int().min(1).optional(),
  expiresAt: z.coerce.date().optional(),
  isActive: z.coerce.boolean().optional().default(true),
});
const orderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});
const blogSchema = z.object({
  title: z.string().trim().min(4).max(180),
  slug: z.string().trim().min(2).max(120),
  author: z.string().trim().min(2).max(100),
  readTime: z.string().trim().min(2).max(30),
  category: z.string().trim().min(2).max(60).optional(),
  excerpt: z.string().max(500).optional().default(""),
  content: z.string().min(20).max(50000),
  coverImage: z.string().url().or(z.literal("")).optional(),
  tags: z.array(z.string().trim().max(40)).max(12).optional().default([]),
  status: z.enum(BLOG_POST_STATUSES).optional().default(BLOG_POST_STATUSES[0]),
  allowComments: z.coerce.boolean().optional().default(true),
});
const staffUserFields = {
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  role: z.enum(ADMIN_ROLES),
  isActive: z.coerce.boolean(),
  pageAccess: z.array(z.enum(adminPortalPages)).optional().default([]),
};
const validateStaffPages = (user, ctx) => {
  if (user.pageAccess.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["pageAccess"], message: "Choose at least one page for this user." });
  }
};
const staffUserSchema = z.object({
  ...staffUserFields,
  password: z.string().min(8).max(128),
}).superRefine(validateStaffPages);
const staffUserUpdateSchema = z.object({
  ...staffUserFields,
  password: z.string().min(8).max(128).optional(),
}).superRefine(validateStaffPages);
const slugify = (value) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const validId = (id) => mongoose.isValidObjectId(id);
const invalid = (res, parsed) =>
  res
    .status(400)
    .json({
      error: "Please check the submitted fields.",
      details: parsed.error.flatten().fieldErrors,
    });

module.exports = {
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
};
