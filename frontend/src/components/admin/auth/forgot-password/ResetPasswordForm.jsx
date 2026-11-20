"use client";

import { NewPasswordForm } from "./NewPasswordForm";
import { PasswordCardBrand } from "./PasswordCardBrand";
import { ResetLinkUnavailable } from "./ResetLinkUnavailable";
import { ResetPasswordSuccess } from "./ResetPasswordSuccess";
import { useResetPasswordForm } from "./useResetPasswordForm";
import "./theme.css";

/**
 * Admin reset-password card for the emailed link: new password form, a
 * notice for incomplete links, then a success confirmation.
 * @param {object} props
 * @param {string} [props.token] Reset token from the link.
 * @param {string} [props.email] Account email from the link.
 */
export function ResetPasswordForm({ token = "", email = "" }) {
  const form = useResetPasswordForm({ token, email });

  return (
    <main className="fp-page min-h-screen bg-[var(--fp-bg-page)] px-5 py-8 text-[var(--fp-text-primary)]">
      <section className="fp-card w-full max-w-md rounded-[var(--fp-radius-card)] border border-[var(--fp-border)] bg-[var(--fp-bg-card)] p-8 shadow-xl sm:p-10">
        <PasswordCardBrand logo="/admin-login-logo-clean.png" alt="Health With Herbal" />
        {form.status === "success" ? (
          <ResetPasswordSuccess />
        ) : !form.hasResetLink ? (
          <ResetLinkUnavailable />
        ) : (
          <NewPasswordForm form={form} />
        )}
      </section>
    </main>
  );
}

export default ResetPasswordForm;
