"use client";

import { ForgotPasswordForm } from "./ForgotPasswordForm";

/**
 * Forgot-password page body; forwards every prop to `ForgotPasswordForm`.
 * @param {object} props See `ForgotPasswordForm`.
 */
export function ForgotPasswordPage(props) {
  return <ForgotPasswordForm {...props} />;
}

export default ForgotPasswordPage;
