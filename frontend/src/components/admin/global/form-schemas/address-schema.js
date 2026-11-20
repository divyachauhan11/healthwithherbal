/**
 * Shipping address form fields for `FormModal entity="address"` (storefront
 * checkout and account pages).
 * @param {{isEditing: boolean}} context
 * @returns {{title: string, subtitle: string, fields: Array<object>}}
 */
export function buildAddressSchema({ isEditing }) {
  return {
    title: isEditing ? "Edit Address" : "Add New Address",
    subtitle: isEditing
      ? "Update your delivery recipient details, street address, and preferences."
      : "Add a shipping address for smooth delivery and one-click checkout.",
    fields: [
      {
        name: "fullName",
        label: "Full Name",
        type: "text",
        required: true,
        placeholder: "Recipient Full Name (e.g. Aarav Sharma)",
      },
      {
        name: "phone",
        label: "Phone Number",
        type: "tel",
        required: true,
        placeholder: "10-digit mobile number",
      },
      {
        name: "tag",
        label: "Address Type / Tag",
        type: "select",
        defaultValue: "Home",
        options: [
          { value: "Home", label: "Home" },
          { value: "Work", label: "Work / Office" },
          { value: "Other", label: "Other" },
        ],
      },
      {
        name: "country",
        label: "Country",
        type: "select",
        required: true,
        defaultValue: "India",
        options: [
          { value: "India", label: "India" },
          { value: "United States", label: "United States" },
          { value: "United Kingdom", label: "United Kingdom" },
          { value: "Canada", label: "Canada" },
          { value: "Australia", label: "Australia" },
          { value: "United Arab Emirates", label: "United Arab Emirates" },
        ],
      },
      {
        name: "line1",
        label: "Street Address Line 1",
        type: "text",
        span: "wide",
        required: true,
        placeholder: "House / Flat No., Apartment, Building, Street",
      },
      {
        name: "line2",
        label: "Address Line 2 (Optional)",
        type: "text",
        span: "wide",
        placeholder: "Area, Landmark, Sector, Colony",
      },
      {
        name: "city",
        label: "City",
        type: "text",
        required: true,
        placeholder: "City / District",
      },
      {
        name: "state",
        label: "State / Province",
        type: "text",
        placeholder: "State / Province",
      },
      {
        name: "postalCode",
        label: "Postal Code (PIN)",
        type: "text",
        required: true,
        placeholder: "e.g. 110001",
      },
      {
        name: "isDefault",
        label: "Make this my default shipping address",
        type: "checkbox",
        span: "wide",
        defaultValue: false,
      },
    ],
  };
}

/**
 * Trim address text fields and coerce the default flag (mutates `payload`).
 * @param {object} payload
 */
export function normalizeAddressPayload(payload) {
  if (payload.fullName) payload.fullName = String(payload.fullName).trim();
  if (payload.phone) payload.phone = String(payload.phone).trim();
  if (payload.line1) payload.line1 = String(payload.line1).trim();
  if (payload.line2) payload.line2 = String(payload.line2).trim();
  if (payload.city) payload.city = String(payload.city).trim();
  if (payload.state) payload.state = String(payload.state).trim();
  if (payload.postalCode)
    payload.postalCode = String(payload.postalCode).trim();
  if (payload.country) payload.country = String(payload.country).trim();
  if (payload.tag) payload.tag = String(payload.tag).trim();
  if (payload.isDefault !== undefined)
    payload.isDefault = Boolean(payload.isDefault);
}
