const crypto = require("node:crypto");

/**
 * Hashes a password using the backend's existing scrypt storage format.
 * @param {string} password Plain-text password.
 * @returns {string} `scrypt$<16-byte-hex-salt>$<64-byte-hex-hash>`.
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

/**
 * Checks a password against the existing scrypt storage format.
 * @param {string} password Plain-text password to check.
 * @param {string} storedHash Stored `scrypt$<salt>$<hash>` value.
 * @returns {boolean} Whether the password matches.
 */
function verifyPassword(password, storedHash) {
  const [scheme, salt, expectedHash] = String(storedHash || "").split("$");
  if (scheme !== "scrypt" || !salt || !/^[a-f0-9]{128}$/i.test(expectedHash || "")) {
    return false;
  }

  const actualHash = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHash, "hex");
  return (
    expected.length === actualHash.length &&
    crypto.timingSafeEqual(expected, actualHash)
  );
}

/**
 * Signs a token payload using the backend's existing HMAC format.
 * @param {string} value Encoded token payload.
 * @param {string} secret HMAC secret.
 * @returns {string} Base64url encoded SHA-256 HMAC.
 */
function signHmac(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

/**
 * Compares two values in constant time when their byte lengths match.
 * @param {string|Buffer} left First value.
 * @param {string|Buffer} right Second value.
 * @returns {boolean} Whether the values match.
 */
function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

/**
 * Verifies a token signature using the same comparison as existing sessions.
 * @param {string} value Encoded token payload.
 * @param {string} signature Supplied HMAC signature.
 * @param {string} secret HMAC secret.
 * @returns {boolean} Whether the signature is valid.
 */
function verifyHmac(value, signature, secret) {
  return safeEqual(signature, signHmac(value, secret));
}

module.exports = {
  hashPassword,
  verifyPassword,
  signHmac,
  safeEqual,
  verifyHmac,
};
