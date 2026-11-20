/**
 * Error message box of the signup and code steps.
 * @param {object} props
 * @param {string} props.error
 * @param {import("react").CSSProperties} [props.style] Optional inline style of the box.
 */
export function AuthErrorBox({ error, style }) {
  return (
    <div className="auth-error-box" style={style}>
      <p className="auth-error-msg">{error}</p>
    </div>
  );
}
