import { ProductBadgeField } from "../form-fields/ProductBadgeField";

/**
 * Product form fields for `FormModal entity="product"`.
 * @param {{isEditing: boolean, brands: Array, productCategories: Array}} context
 * @returns {{title: string, subtitle: string, fields: Array<object>}}
 */
export function buildProductSchema({ isEditing, brands, productCategories }) {
  return {
    title: isEditing ? "Edit Product" : "Add New Product",
    subtitle: isEditing
      ? "Update catalog details, pricing, photos, and available stock."
      : "Create a new catalog item with photos, pricing, and inventory.",
    fields: [
      {
        name: "title",
        label: "Product name",
        type: "text",
        span: "wide",
        required: true,
        placeholder: "e.g. Pure Organic Ashwagandha Root Powder",
      },
      {
        name: "sku",
        label: "SKU",
        type: "text",
        required: true,
        placeholder: "e.g. ASH-500G",
      },
      {
        name: "brand",
        label: "Brand",
        type: "select",
        required: true,
        placeholder: "Choose brand",
        options: brands.map((b) => ({ value: b.name, label: b.name })),
      },
      {
        name: "category",
        label: "Category",
        type: "select",
        required: true,
        placeholder: "Choose category",
        options: productCategories.map((c) => ({
          value: c.name,
          label: c.name,
        })),
      },
      {
        name: "stockQty",
        label: "Stock quantity",
        type: "number",
        min: 0,
        step: 1,
        required: true,
        placeholder: "0",
        defaultValue: 0,
      },
      {
        name: "original",
        label: "Regular price (₹)",
        type: "number",
        min: 0,
        step: 0.01,
        required: true,
        placeholder: "e.g. 599.00",
      },
      {
        name: "price",
        label: "Sale price (₹)",
        type: "number",
        min: 0,
        step: 0.01,
        required: true,
        placeholder: "e.g. 499.00",
      },
      {
        name: "badge",
        label: "Product badge (Promotion Tag)",
        type: "custom",
        render: ({ value, onChange }) => (
          <ProductBadgeField value={value} onChange={onChange} />
        ),
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        rows: 4,
        span: "wide",
        required: true,
        placeholder:
          "Describe the product benefits, ingredients, and usage instructions...",
      },
      {
        name: "images",
        label: "Product Photos (Multiple uploads supported)",
        type: "images",
        multiple: true,
        maxImages: 9,
        span: "wide",
        description:
          "Upload up to 9 high-quality product images. The first photo will be used as the main storefront cover.",
      },
      {
        name: "active",
        label: "Visible in storefront (Active for customers to purchase)",
        type: "checkbox",
        span: "wide",
        defaultValue: true,
      },
    ],
  };
}

/**
 * Convert product form values to the API types (mutates `payload`).
 * @param {object} payload
 */
export function normalizeProductPayload(payload) {
  if (payload.price !== undefined) payload.price = Number(payload.price);
  if (payload.original !== undefined)
    payload.original = Number(payload.original);
  if (payload.stockQty !== undefined)
    payload.stockQty = Number(payload.stockQty);
  if (payload.badge !== undefined) {
    payload.badge = payload.badge ? String(payload.badge).trim() : null;
  }
}
