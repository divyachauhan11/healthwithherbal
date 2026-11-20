/**
 * Parent category form fields for `FormModal entity="parent-category"`.
 * @param {{isEditing: boolean}} context
 * @returns {{title: string, subtitle: string, fields: Array<object>}}
 */
export function buildParentCategorySchema({ isEditing }) {
  return {
    title: isEditing ? "Edit Parent Category" : "Add New Parent Category",
    subtitle: isEditing
      ? "Update this top-level category used to group related categories."
      : "Create a top-level category that can be selected when creating regular categories.",
    fields: [
      {
        name: "name",
        label: "Parent category name",
        type: "text",
        required: true,
        placeholder: "Enter a parent category name",
      },
      {
        name: "slug",
        label: "URL Slug",
        type: "slug",
        from: "name",
        required: true,
        help: "Used in web URL: /category/{slug}",
        placeholder: "parent-category-slug",
      },
      {
        name: "isActive",
        label: "Active",
        type: "checkbox",
        defaultValue: true,
      },
    ],
  };
}

/**
 * Mark the record as a top-level category (mutates `payload`).
 * @param {object} payload
 */
export function normalizeParentCategoryPayload(payload) {
  payload.isParent = true;
  payload.parentId = null;
  payload.type = "form";
}
