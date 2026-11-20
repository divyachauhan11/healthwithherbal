import { useState } from "react";
import { resetAdminPassword } from "@/lib/admin-api";
import { validateNewPassword } from "./password-utils";

/**
 * Own the reset-password form: both password values and their visibility,
 * validation and the reset request.
 * @param {object} options
 * @param {string} options.token Reset token from the emailed link.
 * @param {string} options.email Account email from the emailed link.
 * @returns {{
 *   password: string,
 *   confirmPassword: string,
 *   status: "default"|"loading"|"success"|"error",
 *   error: string,
 *   showPassword: boolean,
 *   showConfirmPassword: boolean,
 *   hasResetLink: boolean,
 *   changePassword: (value: string) => void,
 *   changeConfirmPassword: (value: string) => void,
 *   togglePasswordVisible: () => void,
 *   toggleConfirmPasswordVisible: () => void,
 *   submit: (event: import("react").FormEvent) => Promise<void>,
 * }}
 */
export function useResetPasswordForm({ token, email }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("default");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const validationError = validateNewPassword(password, confirmPassword);
    if (validationError) {
      setStatus("error");
      setError(validationError);
      return;
    }
    setError("");
    setStatus("loading");
    try {
      await resetAdminPassword({ email, token, password });
      setStatus("success");
      setPassword("");
      setConfirmPassword("");
    } catch (requestError) {
      setError(requestError?.message || "Could not reset your password. Request a new link and try again.");
      setStatus("error");
    }
  };

  const changePassword = (value) => {
    setPassword(value);
    if (error) setError("");
  };

  const changeConfirmPassword = (value) => {
    setConfirmPassword(value);
    if (error) setError("");
  };

  return {
    password,
    confirmPassword,
    status,
    error,
    showPassword,
    showConfirmPassword,
    hasResetLink: Boolean(token && email),
    changePassword,
    changeConfirmPassword,
    togglePasswordVisible: () => setShowPassword((visible) => !visible),
    toggleConfirmPasswordVisible: () => setShowConfirmPassword((visible) => !visible),
    submit,
  };
}
