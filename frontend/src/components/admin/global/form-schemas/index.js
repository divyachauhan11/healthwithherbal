import { buildAddressSchema, normalizeAddressPayload } from "./address-schema";
import { buildBlogSchema, normalizeBlogPayload } from "./blog-schema";
import { buildBrandSchema } from "./brand-schema";
import { buildCategorySchema, normalizeCategoryPayload } from "./category-schema";
import { buildCouponSchema, normalizeCouponPayload } from "./coupon-schema";
import {
  buildParentCategorySchema,
  normalizeParentCategoryPayload,
} from "./parent-category-schema";
import { buildProductSchema, normalizeProductPayload } from "./product-schema";

export { buildAddressSchema, normalizeAddressPayload } from "./address-schema";
export { buildBlogSchema, normalizeBlogPayload } from "./blog-schema";
export { buildBrandSchema } from "./brand-schema";
export { buildCategorySchema, normalizeCategoryPayload } from "./category-schema";
export { buildCouponSchema, normalizeCouponPayload } from "./coupon-schema";
export {
  buildParentCategorySchema,
  normalizeParentCategoryPayload,
} from "./parent-category-schema";
export { buildProductSchema, normalizeProductPayload } from "./product-schema";

/**
 * Pre-defined entity schemas for zero-boilerplate admin modal forms.
 * @param {string} entity "product" | "category" | "parent-category" | "brand" | "address" | "coupon" | "blog"
 * @param {{initial?: object|null, catalog?: {brands?: Array, categories?: Array}, brands?: Array, categories?: Array}} options
 * @returns {{title: string, subtitle: string, fields: Array<object>}}
 */
export function getEntitySchema(
  entity,
  { initial, catalog, brands = [], categories = [] },
) {
  const allBrands = catalog?.brands || brands || [];
  const allCategories = catalog?.categories || categories || [];
  const context = {
    isEditing: Boolean(initial?._id),
    brands: allBrands,
    productCategories: allCategories.filter((category) => !category.isParent),
    parentCategories: allCategories.filter((category) => category.isParent),
  };

  switch (entity?.toLowerCase()) {
    case "product":
      return buildProductSchema(context);
    case "category":
      return buildCategorySchema(context);
    case "parent-category":
      return buildParentCategorySchema(context);
    case "brand":
      return buildBrandSchema(context);
    case "address":
      return buildAddressSchema(context);
    case "coupon":
      return buildCouponSchema(context);
    case "blog":
      return buildBlogSchema(context);
    default:
      return { title: "Edit", subtitle: "", fields: [] };
  }
}

/**
 * Apply the entity-specific payload cleanup before saving (mutates `payload`).
 * @param {string|undefined} entity
 * @param {object} payload Form values plus image fields.
 * @param {object|null} initial Record being edited, if any.
 * @returns {object} The same payload.
 */
export function normalizeEntityPayload(entity, payload, initial) {
  switch (entity?.toLowerCase()) {
    case "coupon":
      normalizeCouponPayload(payload);
      break;
    case "blog":
      normalizeBlogPayload(payload, initial);
      break;
    case "product":
      normalizeProductPayload(payload);
      break;
    case "category":
      normalizeCategoryPayload(payload, initial);
      break;
    case "parent-category":
      normalizeParentCategoryPayload(payload);
      break;
    case "address":
      normalizeAddressPayload(payload);
      break;
    default:
      break;
  }
  return payload;
}
