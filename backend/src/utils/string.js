/**
 * Converts a value into the backend's existing URL slug format.
 * @param {string} value Source text.
 * @returns {string} Lowercase hyphen-separated slug.
 */
function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Escapes special characters for safe insertion into HTML text or attributes.
 * @param {*} value Value to escape.
 * @returns {string} HTML-escaped string.
 */
function escapeHtml(value) {
  const escapes = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return String(value ?? "").replace(/[&<>"']/g, (character) => escapes[character]);
}

/**
 * Normalizes a phone number to its last ten digits when available.
 * @param {*} rawPhone Original phone value.
 * @returns {string} Digits-only normalized number.
 */
function normalizePhone(rawPhone) {
  if (!rawPhone) return "";
  const digits = String(rawPhone).replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

module.exports = { slugify, escapeHtml, normalizePhone };
