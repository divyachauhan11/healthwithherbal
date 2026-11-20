import { Check, Mail } from "lucide-react";
import { ResendLinkButton } from "./ResendLinkButton";

/**
 * "Check your email" confirmation shown after a reset link was requested.
 * @param {object} props
 * @param {string} props.email Address the link was sent to.
 * @param {number} props.secondsLeft Resend cooldown left.
 * @param {number|string} props.cooldownSeconds Total resend cooldown.
 * @param {boolean} props.loading
 * @param {() => void} props.onResend
 * @param {import("react").ReactNode} props.backControl "Back to login" control.
 */
export function ForgotPasswordSuccess({ email, secondsLeft, cooldownSeconds, loading, onResend, backControl }) {
  return (
    <div className="fp-success" role="status">
      <div className="fp-success-icon"><Check size={24} aria-hidden="true" /></div>
      <span className="fp-eyebrow">ACCOUNT RECOVERY</span>
      <h1 className="fp-title">Check your email</h1>
      <p className="fp-subtitle">
        If an account exists for this address, we’ve sent a secure reset link.
      </p>
      <div className="fp-email-chip"><Mail size={17} aria-hidden="true" /><strong>{email}</strong></div>
      <p className="fp-delivery-note">Check your inbox and spam folder. The link expires in 30 minutes.</p>
      <ResendLinkButton
        secondsLeft={secondsLeft}
        cooldownSeconds={cooldownSeconds}
        loading={loading}
        onResend={onResend}
      />
      <div className="fp-footer">{backControl}</div>
    </div>
  );
}
