/** Image types accepted for profile photos. */
export const AVATAR_FILE_TYPES = Object.freeze(["image/jpeg", "image/png", "image/webp", "image/avif"]);

/** Largest accepted profile photo, in bytes (5 MB). */
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

/**
 * Up to two upper-case initials of a name ("Admin" when empty).
 * @param {string} [name]
 * @returns {string}
 */
export const getProfileInitials = (name) =>
  (name || "Admin")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

/**
 * Display label of an admin role.
 * @param {string} [role]
 * @returns {"Team member"|"Administrator"}
 */
export const getProfileRoleLabel = (role) => (role === "employee" ? "Team member" : "Administrator");

/**
 * Validation message for a chosen profile photo, or "" when it is acceptable.
 * @param {File} file
 * @returns {string}
 */
export const getAvatarFileError = (file) => {
  if (!AVATAR_FILE_TYPES.includes(file.type)) {
    return "Choose a JPG, PNG, WebP, or AVIF image for your profile photo.";
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return "Profile photos must be 5 MB or smaller.";
  }
  return "";
};

/**
 * Date such as "5 November 2026", or "—" when missing.
 * @param {string|number|Date} [value]
 * @returns {string}
 */
export const formatMemberSince = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";
