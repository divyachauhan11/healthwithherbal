/** Six empty OTP digits. */
export const emptyOtp = () => ["", "", "", "", "", ""];

/** Loose email shape check used by the signup step. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Keep only the digits of a phone number or code. */
export const digitsOnly = (value) => value.replace(/\D/g, "");

/**
 * Validate the login identifier (email, or a mobile number with at least 10 digits).
 * @param {string} cleanInput Trimmed identifier.
 * @returns {string} Error message, or "" when valid.
 */
export function validateLoginIdentifier(cleanInput) {
  if (!cleanInput) {
    return "Please enter your registered email address or mobile number.";
  }
  const isEmail = cleanInput.includes("@");
  if (!isEmail) {
    const cleanPhone = digitsOnly(cleanInput);
    if (cleanPhone.length < 10) {
      return "Please enter a valid 10-digit mobile number or email address.";
    }
  }
  return "";
}

/**
 * Validate the signup details.
 * @param {{fullName: string, cleanEmail: string, cleanPhone: string}} details
 * @returns {string} Error message, or "" when valid.
 */
export function validateSignupDetails({ fullName, cleanEmail, cleanPhone }) {
  if (!fullName || !fullName.trim()) {
    return "Please enter your full name.";
  }
  if (!cleanEmail || !EMAIL_PATTERN.test(cleanEmail)) {
    return "Please enter a valid email address.";
  }
  if (cleanPhone.length < 10) {
    return "Please enter a valid 10-digit mobile number.";
  }
  return "";
}

/**
 * Spread pasted text over the six OTP boxes.
 * @param {string} text Clipboard text.
 * @returns {{digits: string[], focusIndex: number}|null} New digits and the box to focus, or null when nothing numeric was pasted.
 */
export function otpFromPaste(text) {
  const pasteData = digitsOnly(text).slice(0, 6);
  if (!pasteData) return null;
  const digits = emptyOtp();
  for (let i = 0; i < 6; i++) {
    digits[i] = pasteData[i] || "";
  }
  return { digits, focusIndex: Math.min(pasteData.length, 5) };
}

/** Focus one of the OTP boxes (`#otp-<index>`), if present. */
export const focusOtpBox = (index) => document.getElementById(`otp-${index}`)?.focus();
