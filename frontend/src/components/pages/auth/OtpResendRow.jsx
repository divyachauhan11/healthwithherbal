/**
 * "Didn't receive the email?" row: resend countdown, then a resend action.
 * @param {object} props
 * @param {number} props.cooldown Seconds until the code can be resent.
 * @param {boolean} props.loading Disables the resend action.
 * @param {() => void} props.onResend
 */
export function OtpResendRow({ cooldown, loading, onResend }) {
  return (
    <div className="auth-otp-resend">
      <span>Didn&apos;t receive the email?</span>
      {cooldown > 0 ? (
        <span
          style={{
            fontSize: "12px",
            color: "#94a3b8",
            fontWeight: 600,
          }}
        >
          Resend in {cooldown}s
        </span>
      ) : (
        <button
          type="button"
          className="auth-link-btn"
          onClick={onResend}
          disabled={loading}
        >
          Resend Code
        </button>
      )}
    </div>
  );
}
