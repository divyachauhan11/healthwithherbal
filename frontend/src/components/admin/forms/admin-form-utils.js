/**
 * Image list of a record: its `images`, else the first present fallback key.
 * @param {object|null|undefined} initial Record being edited.
 * @param {string[]} fallbackKeys Single-image keys to try in order, e.g. ["image", "logoUrl"].
 * @returns {string[]}
 */
export function getRecordImages(initial, fallbackKeys) {
  if (Array.isArray(initial?.images) && initial.images.length) return initial.images;
  for (const key of fallbackKeys) {
    if (initial?.[key]) return [initial[key]];
  }
  return [];
}
