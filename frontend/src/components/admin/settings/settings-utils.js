/** Most messages the storefront announcement bar can hold. */
export const MAX_ANNOUNCEMENTS = 12;

/** Number of parent categories featured on the homepage. */
export const FEATURED_CATEGORY_LIMIT = 4;

/** Event dispatched on `window` after the return/exchange setting is saved. */
export const RETURN_EXCHANGE_SETTING_EVENT = "hwh-return-exchange-setting";

/**
 * IDs from an API response as strings (empty when the list is missing).
 * @param {unknown} ids
 * @returns {string[]}
 */
export const toIdStrings = (ids) => (Array.isArray(ids) ? ids.map(String) : []);

/**
 * Announcement list after saving `value` as a new entry (`editing === "new"`) or in place
 * of the entry at index `editing`.
 * @param {string[]} announcements
 * @param {"new"|number} editing
 * @param {string} value
 * @returns {string[]}
 */
export const applyAnnouncementEdit = (announcements, editing, value) =>
  editing === "new"
    ? [...announcements, value]
    : announcements.map((item, index) => index === editing ? value : item);

/**
 * Rows of the announcements table: a blank "new" row first while adding, then one row
 * per announcement.
 * @param {string[]} announcements
 * @param {"new"|number|null} editing
 * @returns {Array<{id: string, isNew?: boolean, index?: number, announcement: string}>}
 */
export const toAnnouncementRows = (announcements, editing) => [
  ...(editing === "new" ? [{ id: "new", isNew: true, announcement: "" }] : []),
  ...announcements.map((announcement, index) => ({
    id: `${index}-${announcement}`,
    index,
    announcement,
  })),
];
