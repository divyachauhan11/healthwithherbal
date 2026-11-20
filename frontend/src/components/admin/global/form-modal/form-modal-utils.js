/**
 * Whether a schema field is an image upload field.
 * @param {{type?: string}} field
 * @returns {boolean}
 */
export const isImageField = (field) =>
  field.type === "images" || field.type === "image";

/**
 * Whether a schema field is hidden for the current values (`hide` may be a
 * boolean or a predicate of the form values).
 * @param {object} field
 * @param {object} form Current form values.
 * @returns {boolean}
 */
export function isFieldHidden(field, form) {
  if (typeof field.hide === "function" && field.hide(form)) return true;
  if (field.hide === true) return true;
  return false;
}

/**
 * Whether a schema field spans the full form width.
 * @param {{span?: string|number}} field
 * @returns {boolean}
 */
export const isWideField = (field) => field.span === "wide" || field.span === 2;

/**
 * Pick the fields to render: explicit `fields`, else the entity schema's, else
 * a new empty list.
 * @param {Array<object>|undefined} customFields
 * @param {{fields?: Array<object>}|null} entitySchema
 * @returns {Array<object>}
 */
export const resolveFormFields = (customFields, entitySchema) =>
  customFields || entitySchema?.fields || [];

/**
 * Starting value of every non-image field: the record's value (dates as
 * YYYY-MM-DD, tag arrays joined), otherwise the field default or "".
 * @param {Array<object>} fields
 * @param {object|null} initial Record being edited, if any.
 * @returns {object}
 */
export function getInitialFieldValues(fields, initial) {
  const initialValues = {};
  fields.forEach((field) => {
    if (isImageField(field)) return;
    const rawVal = initial?.[field.name];
    if (rawVal !== undefined && rawVal !== null) {
      if (field.type === "date" && rawVal) {
        try {
          initialValues[field.name] = new Date(rawVal)
            .toISOString()
            .slice(0, 10);
        } catch {
          initialValues[field.name] = rawVal;
        }
      } else if (Array.isArray(rawVal) && field.name === "tags") {
        initialValues[field.name] = rawVal.join(", ");
      } else {
        initialValues[field.name] = rawVal;
      }
    } else {
      initialValues[field.name] =
        field.defaultValue !== undefined ? field.defaultValue : "";
    }
  });
  return initialValues;
}

/**
 * Starting image list from a record's `images`, `image`, `logoUrl` or `coverImage`.
 * @param {object|null} initial
 * @returns {string[]}
 */
export const getInitialImages = (initial) =>
  Array.isArray(initial?.images) && initial.images.length
    ? initial.images
    : initial?.image
      ? [initial.image]
      : initial?.logoUrl
        ? [initial.logoUrl]
        : initial?.coverImage
          ? [initial.coverImage]
          : [];

/**
 * Flag every slug field as manually set (used when editing, so slugs no longer
 * follow their source field).
 * @param {Array<object>} fields
 * @returns {Record<string, true>}
 */
export const getSlugFieldFlags = (fields) =>
  fields.reduce((acc, f) => {
    if (f.type === "slug") acc[f.name] = true;
    return acc;
  }, {});

/**
 * Copy the image list into the image-related payload keys (mutates `payload`).
 * @param {object} payload
 * @param {string[]} images
 */
export function applyImagePayload(payload, images) {
  const primary = images[0] || "";
  payload.image = primary;
  payload.logoUrl = primary;
  payload.coverImage = primary;
  payload.images = images.length ? images : primary ? [primary] : [];
}
