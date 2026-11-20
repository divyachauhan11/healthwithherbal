/** Email shape accepted by the forgot-password form. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Elapsed share of the resend cooldown, as a CSS width percentage (0–100).
 * @param {number} secondsLeft
 * @param {number|string} cooldownSeconds Total cooldown.
 * @returns {string} e.g. "25%".
 */
export const cooldownProgressWidth = (secondsLeft, cooldownSeconds) =>
  `${Math.min(100, Math.max(0, ((Number(cooldownSeconds) - secondsLeft) / Math.max(1, Number(cooldownSeconds))) * 100))}%`;

/**
 * Validate a new password and its confirmation.
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {string} Error message, or "" when valid.
 */
export function validateNewPassword(password, confirmPassword) {
  if (password.length < 8 || password.length > 128) {
    return "Your password must be between 8 and 128 characters.";
  }
  if (password !== confirmPassword) {
    return "The passwords do not match.";
  }
  return "";
}
