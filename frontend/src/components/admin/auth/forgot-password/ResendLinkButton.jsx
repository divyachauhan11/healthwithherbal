import { cooldownProgressWidth } from "./password-utils";

/**
 * Resend action of the forgot-password success view, with the cooldown
 * countdown and progress track.
 * @param {object} props
 * @param {number} props.secondsLeft Seconds until resending is allowed.
 * @param {number|string} props.cooldownSeconds Total cooldown.
 * @param {boolean} props.loading
 * @param {() => void} props.onResend
 */
export function ResendLinkButton({ secondsLeft, cooldownSeconds, loading, onResend }) {
  return (
    <div className="fp-resend-wrap">
      <button type="button" onClick={onResend} disabled={secondsLeft > 0 || loading} className="fp-button fp-button-full">
        {secondsLeft > 0 ? <>Resend link <span className="fp-countdown">Available in {secondsLeft}s</span></> : "Resend reset link"}
      </button>
      {secondsLeft > 0 && (
        <div className="fp-cooldown-track" aria-hidden="true">
          <span style={{ width: cooldownProgressWidth(secondsLeft, cooldownSeconds) }} />
        </div>
      )}
    </div>
  );
}
