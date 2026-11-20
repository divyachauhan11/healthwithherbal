import { AuthErrorBox } from "./AuthErrorBox";
import { AuthSecuredBy } from "./AuthSecuredBy";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { AuthToggleNote } from "./AuthToggleNote";

/**
 * Signup step of the auth modal: full name, email and mobile number.
 * @param {object} props
 * @param {string} props.fullName
 * @param {string} props.email
 * @param {string} props.mobileNumber
 * @param {string} props.error
 * @param {boolean} props.loading
 * @param {(value: string) => void} props.onFullNameChange
 * @param {(value: string) => void} props.onEmailChange
 * @param {(value: string) => void} props.onMobileNumberChange
 * @param {(event: import("react").FormEvent) => void} props.onSubmit Requests the signup code.
 * @param {() => void} props.onShowLogin
 */
export function SignupStep({
  fullName,
  email,
  mobileNumber,
  error,
  loading,
  onFullNameChange,
  onEmailChange,
  onMobileNumberChange,
  onSubmit,
  onShowLogin,
}) {
  return (
    <div className="auth-modal-content">
      <h2 className="auth-modal-title">Create Account</h2>
      <p className="auth-modal-sub">
        Join 25,000+ lovers of pure Ayurvedic rituals.
      </p>

      <form onSubmit={onSubmit} className="auth-form">
        <label className="auth-label">
          <span>
            Full Name <span className="required-star">*</span>
          </span>
          <input
            type="text"
            required
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            className="auth-input"
            autoFocus
            disabled={loading}
          />
        </label>

        <label className="auth-label">
          <span>
            Email Address <span className="required-star">*</span>
          </span>
          <input
            type="email"
            required
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="auth-input"
            disabled={loading}
          />
          <span
            style={{
              fontSize: "11px",
              color: "#64748b",
              marginTop: "-3px",
            }}
          >
            Verification OTP will be delivered to this email.
          </span>
        </label>

        <label className="auth-label">
          <span>
            Mobile Number <span className="required-star">*</span>
          </span>
          <input
            type="tel"
            required
            placeholder="Enter 10-digit mobile number"
            value={mobileNumber}
            onChange={(e) => onMobileNumberChange(e.target.value)}
            className="auth-input"
            disabled={loading}
          />
        </label>

        {error && <AuthErrorBox error={error} />}

        <AuthSubmitButton
          loading={loading}
          label="Sign Up & Get Code"
          loadingLabel="Sending code..."
        />
      </form>

      <AuthToggleNote
        prompt="Already have an account?"
        actionLabel="Log In"
        onAction={onShowLogin}
        style={{ marginTop: "16px" }}
      />

      <AuthSecuredBy />
    </div>
  );
}
