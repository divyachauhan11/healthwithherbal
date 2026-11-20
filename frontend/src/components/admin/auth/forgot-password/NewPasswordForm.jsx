import Link from "next/link";
import { Check, LoaderCircle } from "lucide-react";
import { PasswordField } from "./PasswordField";

/**
 * "Set a new password" form: new password with a length hint, confirmation
 * with a match hint, and the submit button.
 * @param {object} props
 * @param {ReturnType<typeof import("./useResetPasswordForm").useResetPasswordForm>} props.form Reset form state and actions.
 */
export function NewPasswordForm({ form }) {
  const {
    password,
    confirmPassword,
    status,
    error,
    showPassword,
    showConfirmPassword,
  } = form;
  return (
    <>
      <span className="fp-eyebrow">ADMIN PORTAL · SECURE RESET</span>
      <h1 className="fp-title text-3xl font-bold">Set a new password</h1>
      <p className="fp-subtitle text-[var(--fp-text-muted)]">Choose a new password for your admin account.</p>
      {error && <div className="fp-error bg-[var(--fp-error-bg)] text-[var(--fp-error-text)]" role="alert">{error}</div>}
      <form onSubmit={form.submit}>
        <PasswordField
          id="reset-password"
          label="New password"
          className="fp-reset-field"
          value={password}
          onChange={form.changePassword}
          visible={showPassword}
          onToggleVisible={form.togglePasswordVisible}
          showLabel="Show new password"
          hideLabel="Hide new password"
          disabled={status === "loading"}
        >
          <div className={`fp-password-hint${password.length >= 8 ? " is-valid" : ""}`}>
            <Check size={14} aria-hidden="true" /> Use at least 8 characters
          </div>
        </PasswordField>

        <PasswordField
          id="confirm-reset-password"
          label="Confirm new password"
          className="fp-reset-field fp-reset-field-confirm"
          value={confirmPassword}
          onChange={form.changeConfirmPassword}
          visible={showConfirmPassword}
          onToggleVisible={form.toggleConfirmPasswordVisible}
          showLabel="Show confirmation password"
          hideLabel="Hide confirmation password"
          disabled={status === "loading"}
        >
          {confirmPassword && (
            <div className={`fp-password-hint${confirmPassword === password ? " is-valid" : " is-invalid"}`} aria-live="polite">
              <Check size={14} aria-hidden="true" /> {confirmPassword === password ? "Passwords match" : "Passwords do not match"}
            </div>
          )}
        </PasswordField>

        <button type="submit" className="fp-button fp-button-full w-full bg-[var(--fp-primary)]" disabled={status === "loading"}>
          {status === "loading" ? <><LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> Updating…</> : "Reset password"}
        </button>
      </form>
      <div className="fp-footer"><Link href="/admin" className="fp-back text-sm">Back to login</Link></div>
    </>
  );
}
