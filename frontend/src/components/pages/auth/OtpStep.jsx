import { AuthErrorBox } from "./AuthErrorBox";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { DevOtpPreview } from "./DevOtpPreview";
import { OtpInfoBanner } from "./OtpInfoBanner";
import { OtpInputRow } from "./OtpInputRow";
import { OtpMailBadge } from "./OtpMailBadge";
import { OtpResendRow } from "./OtpResendRow";

/**
 * Code step of the auth modal: enter the six-digit code emailed for login or signup.
 * @param {object} props
 * @param {"login"|"signup"} props.authMode Flow the code belongs to.
 * @param {string} props.maskedTarget Masked email the code was sent to.
 * @param {string} props.infoMsg Delivery information, or "".
 * @param {string} props.devOtp Development code preview, or "".
 * @param {string[]} props.otp Current digits.
 * @param {string} props.error
 * @param {boolean} props.loading
 * @param {number} props.resendCooldown Seconds until resending is allowed.
 * @param {(index: number, value: string) => void} props.onDigitChange
 * @param {(index: number, key: string) => void} props.onDigitKeyDown
 * @param {(event: import("react").ClipboardEvent) => void} props.onPaste
 * @param {(event: import("react").FormEvent) => void} props.onSubmit Verifies the code.
 * @param {() => void} props.onResend
 * @param {() => void} props.onBack Returns to the login or signup details.
 */
export function OtpStep({
  authMode,
  maskedTarget,
  infoMsg,
  devOtp,
  otp,
  error,
  loading,
  resendCooldown,
  onDigitChange,
  onDigitKeyDown,
  onPaste,
  onSubmit,
  onResend,
  onBack,
}) {
  return (
    <div className="auth-modal-content">
      <OtpMailBadge />

      <h2 className="auth-modal-title">Check Your Email</h2>
      <p className="auth-modal-sub" style={{ marginBottom: "14px" }}>
        We sent a 6-digit verification code to
        <br />
        <strong style={{ color: "#1c3629", fontSize: "14px" }}>
          {maskedTarget || "your email"}
        </strong>
      </p>

      {infoMsg && <OtpInfoBanner message={infoMsg} />}

      {devOtp && <DevOtpPreview code={devOtp} />}

      <form onSubmit={onSubmit} className="auth-form">
        <OtpInputRow
          otp={otp}
          disabled={loading}
          onDigitChange={onDigitChange}
          onDigitKeyDown={onDigitKeyDown}
          onPaste={onPaste}
        />

        {error && (
          <AuthErrorBox error={error} style={{ marginBottom: "10px" }} />
        )}

        <AuthSubmitButton
          loading={loading}
          label="Verify & Continue"
          loadingLabel={
            authMode === "signup"
              ? "Creating Account in DB..."
              : "Verifying..."
          }
        />
      </form>

      <OtpResendRow
        cooldown={resendCooldown}
        loading={loading}
        onResend={onResend}
      />

      <button
        type="button"
        className="auth-back-link"
        onClick={onBack}
        disabled={loading}
      >
        &larr; Change email or mobile number
      </button>
    </div>
  );
}
