/**
 * Coupon form fields for `FormModal entity="coupon"`.
 * @param {{isEditing: boolean}} context
 * @returns {{title: string, subtitle: string, fields: Array<object>}}
 */
export function buildCouponSchema({ isEditing }) {
  return {
    title: isEditing ? "Edit Coupon" : "Create Coupon",
    subtitle: "Configure discount codes, percentages, and usage rules.",
    fields: [
      {
        name: "code",
        label: "Coupon code",
        type: "text",
        required: true,
        uppercase: true,
        placeholder: "e.g. HERBAL25",
      },
      {
        name: "discountType",
        label: "Discount type",
        type: "select",
        required: true,
        defaultValue: "percent",
        options: [
          { value: "percent", label: "Percentage (%)" },
          { value: "fixed", label: "Fixed amount (₹)" },
          { value: "free_shipping", label: "Free shipping" },
        ],
      },
      {
        name: "discountValue",
        label: "Discount value",
        type: "number",
        min: 0,
        step: 0.01,
        required: true,
        placeholder: "e.g. 25 or 150.00",
      },
      {
        name: "minOrderAmount",
        label: "Minimum order value (₹)",
        type: "number",
        min: 0,
        step: 0.01,
        placeholder: "Optional minimum spend",
      },
      {
        name: "usageLimit",
        label: "Usage limit",
        type: "number",
        min: 1,
        placeholder: "Optional max redemptions",
      },
      {
        name: "expiresAt",
        label: "Expiry date",
        type: "date",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        rows: 3,
        span: "wide",
        placeholder: "Internal note or terms for this promotional code...",
      },
      {
        name: "isActive",
        label: "Active coupon (Eligible for checkout application)",
        type: "checkbox",
        span: "wide",
        defaultValue: true,
      },
    ],
  };
}

/**
 * Uppercase the code, drop empty optional limits and coerce the discount value
 * (mutates `payload`).
 * @param {object} payload
 */
export function normalizeCouponPayload(payload) {
  if (payload.code)
    payload.code = String(payload.code).toUpperCase().trim();
  if (!payload.expiresAt) delete payload.expiresAt;
  if (!payload.usageLimit) delete payload.usageLimit;
  if (!payload.minOrderAmount) delete payload.minOrderAmount;
  if (payload.discountValue !== undefined)
    payload.discountValue = Number(payload.discountValue);
}
