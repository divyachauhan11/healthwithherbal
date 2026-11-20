import { LoaderCircle, Mail } from "lucide-react";
import { FormField } from "@/components/shared/FormField";

/**
 * Email form that requests a password reset link.
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.subtitle
 * @param {string} props.error Validation or request error, or "".
 * @param {string} props.email
 * @param {boolean} props.loading
 * @param {string} props.submitButtonText
 * @param {(value: string) => void} props.onEmailChange
 * @param {(event: import("react").FormEvent) => void} props.onSubmit
 * @param {import("react").ReactNode} props.backControl "Back to login" control.
 */
export function ForgotPasswordRequest({
  title,
  subtitle,
  error,
  email,
  loading,
  submitButtonText,
  onEmailChange,
  onSubmit,
  backControl,
}) {
  return (
    <>
      <span className="fp-eyebrow">ADMIN PORTAL</span>
      <h1 className="fp-title">{title}</h1>
      <p className="fp-subtitle">{subtitle}</p>
      {error && <div className="fp-error" role="alert">{error}</div>}
      <form onSubmit={onSubmit} noValidate>
        <FormField
          variant="auth-email"
          id="forgot-password-email"
          label="Email address"
          className="fp-email-field"
        >
          <Mail className="fp-email-icon" size={18} aria-hidden="true" />
          <input
            id="forgot-password-email"
            className="fp-input fp-email-input"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            disabled={loading}
            required
          />
        </FormField>
        <button type="submit" className="fp-button fp-button-full" disabled={loading}>
          {loading ? <><LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> Sending…</> : submitButtonText}
        </button>
      </form>
      <div className="fp-footer">{backControl}</div>
    </>
  );
}
