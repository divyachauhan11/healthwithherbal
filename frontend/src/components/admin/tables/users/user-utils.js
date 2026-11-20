/**
 * Whether a staff account belongs to the signed-in admin (matched by id or
 * by case-insensitive email).
 * @param {Object} person Staff account.
 * @param {string} [currentUserId]
 * @param {string} [currentUserEmail]
 * @returns {boolean}
 */
export const isCurrentAdminUser = (person, currentUserId, currentUserEmail) => Boolean(
  (currentUserId && String(person._id || person.id || "") === String(currentUserId)) ||
  (currentUserEmail && String(person.email || "").trim().toLowerCase() === String(currentUserEmail).trim().toLowerCase()),
);
