/**
 * Six single-digit inputs (`#otp-0` … `#otp-5`) for the emailed code.
 * @param {object} props
 * @param {string[]} props.otp Current digits.
 * @param {boolean} props.disabled
 * @param {(index: number, value: string) => void} props.onDigitChange
 * @param {(index: number, key: string) => void} props.onDigitKeyDown
 * @param {(event: import("react").ClipboardEvent<HTMLInputElement>) => void} props.onPaste
 */
export function OtpInputRow({ otp, disabled, onDigitChange, onDigitKeyDown, onPaste }) {
  return (
    <div className="auth-otp-row">
      {[0, 1, 2, 3, 4, 5].map((idx) => (
        <input
          key={idx}
          id={`otp-${idx}`}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          className="auth-otp-box"
          value={otp[idx]}
          onPaste={onPaste}
          onChange={(e) => onDigitChange(idx, e.target.value)}
          onKeyDown={(e) => onDigitKeyDown(idx, e.key)}
          autoFocus={idx === 0}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
