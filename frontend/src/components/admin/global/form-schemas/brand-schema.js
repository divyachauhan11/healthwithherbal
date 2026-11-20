/**
 * Brand form fields for `FormModal entity="brand"`.
 * @param {{isEditing: boolean}} context
 * @returns {{title: string, subtitle: string, fields: Array<object>}}
 */
export function buildBrandSchema({ isEditing }) {
  return {
    title: isEditing ? "Edit Brand" : "Add Brand",
    subtitle: isEditing
      ? "Update brand information, logos, and promotional imagery."
      : "Add an authentic herbal manufacturer or product partner.",
    fields: [
      {
        name: "name",
        label: "Brand name",
        type: "text",
        required: true,
        placeholder: "Enter a brand name",
      },
      {
        name: "slug",
        label: "URL Slug",
        type: "slug",
        from: "name",
        required: true,
        placeholder: "brand-slug",
      },
      {
        name: "description",
        label: "Brand description",
        type: "textarea",
        rows: 3,
        span: "wide",
        placeholder:
          "Brief history, quality standards, or product focus of this brand...",
      },
      {
        name: "images",
        label: "Brand logo & banners (Multiple uploads supported)",
        type: "images",
        multiple: true,
        span: "wide",
        description:
          "Upload the brand's logo and assets. The first photo will be used as the primary logo.",
      },
      {
        name: "isActive",
        label: "Active Brand (Products available in store)",
        type: "checkbox",
        span: "wide",
        defaultValue: true,
      },
    ],
  };
}
