import { AuthSecuredBy } from "./AuthSecuredBy";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { AuthToggleNote } from "./AuthToggleNote";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { LoginErrorBox } from "./LoginErrorBox";

/**
 * Login step of the auth modal: email or mobile number, request a code, or
 * continue with Google.
 * @param {object} props
 * @param {string} props.loginInput
 * @param {string} props.error
 * @param {boolean} props.notRegistered
 * @param {boolean} props.loading
 * @param {import("react").RefObject<HTMLDivElement>} props.googleButtonRef
 * @param {(value: string) => void} props.onLoginInputChange
 * @param {(event: import("react").FormEvent) => void} props.onSubmit Requests the login code.
 * @param {() => void} props.onCreateAccount Signup prefilled from the unregistered identifier.
 * @param {() => void} props.onShowSignup
 * @param {() => void} props.onGoogleUnavailable
 */
export function LoginStep({
  loginInput,
  error,
  notRegistered,
  loading,
  googleButtonRef,
  onLoginInputChange,
  onSubmit,
  onCreateAccount,
  onShowSignup,
  onGoogleUnavailable,
}) {
  return (
    <div className="auth-modal-content">
      <h2 className="auth-modal-title">Welcome Back!</h2>
      <p className="auth-modal-sub">
        Log in to your account with a secure email verification code.
      </p>

      <form onSubmit={onSubmit} className="auth-form">
        <label className="auth-label">
          <span>
            Email or Mobile Number{" "}
            <span className="required-star">*</span>
          </span>
          <input
            type="text"
            required
            placeholder="Enter email or 10-digit mobile"
            value={loginInput}
            onChange={(e) => onLoginInputChange(e.target.value)}
            className="auth-input"
            autoFocus
            disabled={loading}
          />
        </label>

        {error && (
          <LoginErrorBox
            error={error}
            notRegistered={notRegistered}
            onCreateAccount={onCreateAccount}
          />
        )}

        <AuthSubmitButton
          loading={loading}
          label="Get Verification Code"
          loadingLabel="Sending code..."
        />
      </form>

      <div className="auth-divider">
        <span>or continue with</span>
      </div>

      <div className="auth-social-row">
        <GoogleSignInButton
          buttonRef={googleButtonRef}
          loading={loading}
          onUnavailable={onGoogleUnavailable}
        />
      </div>

      <AuthToggleNote
        prompt="New to Health with Herbal?"
        actionLabel="Create an account"
        onAction={onShowSignup}
      />

      <AuthSecuredBy />
    </div>
  );
}
