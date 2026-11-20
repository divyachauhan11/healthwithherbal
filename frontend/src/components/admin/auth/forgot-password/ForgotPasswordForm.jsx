"use client";

import { BackToLoginControl } from "./BackToLoginControl";
import { ForgotPasswordRequest } from "./ForgotPasswordRequest";
import { ForgotPasswordSuccess } from "./ForgotPasswordSuccess";
import { PasswordCardBrand } from "./PasswordCardBrand";
import { useForgotPasswordForm } from "./useForgotPasswordForm";
import "./theme.css";

/**
 * Forgot-password card: requests a reset link, then confirms it was sent
 * and offers a resend after a cooldown.
 * @param {object} props
 * @param {(email: string) => Promise<void>} props.onSubmit Sends the reset link.
 * @param {() => void} [props.onBackToLogin] Back handler; a link to `loginHref` is used otherwise.
 * @param {string} [props.loginHref="/login"]
 * @param {string|import("react").ReactNode} [props.brandLogo] Logo URL or node.
 * @param {string} [props.title]
 * @param {string} [props.subtitle]
 * @param {string} [props.submitButtonText]
 * @param {number} [props.resendCooldownSeconds=60]
 */
export function ForgotPasswordForm({
  onSubmit,
  onBackToLogin,
  loginHref = "/login",
  brandLogo,
  title = "Forgot your password?",
  subtitle = "Enter the email address associated with your account and we’ll send you a password reset link.",
  submitButtonText = "Send reset link",
  resendCooldownSeconds = 60,
}) {
  const { email, error, status, secondsLeft, changeEmail, submit } = useForgotPasswordForm({
    onSubmit,
    resendCooldownSeconds,
  });

  const backControl = (
    <BackToLoginControl
      onBackToLogin={onBackToLogin}
      loginHref={loginHref}
      disabled={status === "loading"}
    />
  );

  return (
    <main className="fp-page">
      <section className="fp-card" aria-live="polite">
        {brandLogo && <PasswordCardBrand logo={brandLogo} alt="Brand" />}

        {status === "success" ? (
          <ForgotPasswordSuccess
            email={email}
            secondsLeft={secondsLeft}
            cooldownSeconds={resendCooldownSeconds}
            loading={status === "loading"}
            onResend={submit}
            backControl={backControl}
          />
        ) : (
          <ForgotPasswordRequest
            title={title}
            subtitle={subtitle}
            error={error}
            email={email}
            loading={status === "loading"}
            submitButtonText={submitButtonText}
            onEmailChange={changeEmail}
            onSubmit={submit}
            backControl={backControl}
          />
        )}
      </section>
    </main>
  );
}

export default ForgotPasswordForm;
