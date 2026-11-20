import { AlertCircle } from "lucide-react";

/**
 * Error box of the login step; offers to create an account when the
 * identifier is not registered.
 * @param {object} props
 * @param {string} props.error
 * @param {boolean} props.notRegistered Show the "Create an Account" action.
 * @param {() => void} props.onCreateAccount Switches to signup with the identifier prefilled.
 */
export function LoginErrorBox({ error, notRegistered, onCreateAccount }) {
  return (
    <div className="auth-error-box">
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "8px",
        }}
      >
        <AlertCircle
          size={16}
          style={{
            color: "#dc2626",
            flexShrink: 0,
            marginTop: "2px",
          }}
        />
        <div>
          <p className="auth-error-msg">{error}</p>
          {notRegistered && (
            <button
              type="button"
              className="auth-link-btn"
              style={{
                marginTop: "8px",
                display: "inline-block",
                fontWeight: 700,
                textDecoration: "underline",
                color: "var(--forest)",
                fontSize: "12.5px",
              }}
              onClick={onCreateAccount}
            >
              Click here to Create an Account &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
