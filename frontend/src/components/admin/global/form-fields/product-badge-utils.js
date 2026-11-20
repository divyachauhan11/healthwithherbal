/** Badge presets offered under the product badge input. */
export const PRODUCT_BADGE_PRESETS = [
  "New",
  "Bestseller",
  "Featured",
  "Ayurvedic",
  "Organic",
];

/**
 * Split a comma-separated badge value into trimmed, non-empty tags.
 * @param {string} [value]
 * @returns {string[]}
 */
export const parseBadgeTags = (value) =>
  (value || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

/**
 * Whether a tag list contains a preset (case-insensitive).
 * @param {string[]} tags
 * @param {string} preset
 * @returns {boolean}
 */
export const hasBadgeTag = (tags, preset) =>
  tags.some((t) => t.toLowerCase() === preset.toLowerCase());

/**
 * Add the preset when missing, otherwise remove it, and join the result.
 * @param {string[]} tags Current tags.
 * @param {string} preset Preset to toggle.
 * @returns {string} Comma-separated badge value.
 */
export function toggleBadgeTag(tags, preset) {
  let updated;
  if (hasBadgeTag(tags, preset)) {
    updated = tags.filter(
      (t) => t.toLowerCase() !== preset.toLowerCase(),
    );
  } else {
    updated = [...tags, preset];
  }
  return updated.join(", ");
}
