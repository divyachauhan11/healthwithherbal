import { useEffect, useState } from "react";
import { EMAIL_PATTERN } from "./password-utils";

/**
 * Own the forgot-password request: email value, validation, submit status
 * ("default" | "loading" | "success" | "error") and the resend cooldown.
 * @param {object} options
 * @param {(email: string) => Promise<void>} options.onSubmit Sends the reset link for a normalized email.
 * @param {number} options.resendCooldownSeconds Seconds before the link can be resent.
 * @returns {{
 *   email: string,
 *   error: string,
 *   status: "default"|"loading"|"success"|"error",
 *   secondsLeft: number,
 *   changeEmail: (value: string) => void,
 *   submit: (event?: import("react").FormEvent) => Promise<void>,
 * }}
 */
export function useForgotPasswordForm({ onSubmit, resendCooldownSeconds }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("default");
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (status !== "success" || secondsLeft <= 0) return undefined;
    const timer = window.setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [status, secondsLeft]);

  const submit = async (event) => {
    event?.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setStatus("default");
      setError("Enter a valid email address.");
      return;
    }
    if (status === "loading" || (status === "success" && secondsLeft > 0)) return;

    setError("");
    setStatus("loading");
    try {
      await onSubmit(normalizedEmail);
      setEmail(normalizedEmail);
      setSecondsLeft(Math.max(0, Number(resendCooldownSeconds) || 0));
      setStatus("success");
    } catch (submitError) {
      setError(submitError?.message || "We couldn’t process your request. Please try again.");
      setStatus("error");
    }
  };

  const changeEmail = (value) => {
    setEmail(value);
    if (error) setError("");
  };

  return { email, error, status, secondsLeft, changeEmail, submit };
}
