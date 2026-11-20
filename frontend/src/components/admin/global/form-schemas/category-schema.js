import { HeartPulse, Pill } from "lucide-react";

/**
 * Category form fields for `FormModal entity="category"`.
 * @param {{isEditing: boolean, parentCategories: Array}} context
 * @returns {{title: string, subtitle: string, fields: Array<object>}}
 */
export function buildCategorySchema({ isEditing, parentCategories }) {
  return {
    title: isEditing ? "Edit Category" : "Add New Category",
    subtitle: isEditing
      ? "Update category details, health concern type, and storefront visibility."
      : "Create a new herbal category to organize catalog products and navigation.",
    fields: [
      {
        name: "name",
        label: "Category name",
        type: "text",
        span: "wide",
        required: true,
        placeholder:
          "e.g. Immunity & Vitality, Organic Powders, Joint Care",
      },
      {
        name: "slug",
        label: "URL Slug",
        type: "slug",
        from: "name",
        required: true,
        help: "Used in web URL: /category/{slug}",
        placeholder: "e.g. immunity-vitality",
      },
      {
        name: "parentId",
        label: "Parent category (optional)",
        type: "select",
        placeholder: "No parent category",
        options: parentCategories.map((category) => ({
          value: category._id,
          label: category.name,
        })),
      },
      {
        name: "type",
        label: "Category Classification / Placement",
        type: "radio-cards",
        span: "wide",
        required: true,
        defaultValue: "form",
        options: [
          {
            value: "form",
            label: "Product Form / Category",
            desc: 'Visible under the main "Category" filter in catalog (e.g. Skin Care, Hair Care, Herbal Oils, Churan).',
            icon: Pill,
          },
          {
            value: "concern",
            label: "Health Concern",
            desc: 'Visible under the "Shop by concern" filter in catalog (e.g. Arthritis & Joints, Cough & Cold, Diabetic Care).',
            icon: HeartPulse,
          },
        ],
      },
      {
        name: "description",
        label: "Description (optional)",
        type: "textarea",
        rows: 3,
        span: "wide",
        placeholder:
          "Short description of this category for customer navigation and health guidelines...",
      },
      // {
      //   name: "images",
      //   label: "Category Icon or Cover Image",
      //   type: "images",
      //   multiple: false,
      //   span: "wide",
      //   description:
      //     "Upload an icon or banner image representing this category on the storefront.",
      // },
      {
        name: "isActive",
        label:
          "Active in Storefront (Visible in catalog filters and navigation)",
        type: "checkbox",
        span: "wide",
        defaultValue: true,
      },
    ],
  };
}

/**
 * Mark the record as a child category and fill its defaults (mutates `payload`).
 * @param {object} payload
 * @param {object|null} initial Record being edited, if any.
 */
export function normalizeCategoryPayload(payload, initial) {
  if (!payload.parentId) delete payload.parentId;
  if (!payload.type) payload.type = initial?.type || "form";
  payload.isParent = false;
}
