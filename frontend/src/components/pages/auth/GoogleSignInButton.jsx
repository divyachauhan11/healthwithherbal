import { GoogleIcon } from "@/components/pages/shared/icons";

/**
 * Google sign-in control: the container Google renders its button into when
 * `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set, otherwise a placeholder button that
 * reports Google sign-in as unavailable.
 * @param {object} props
 * @param {import("react").RefObject<HTMLDivElement>} props.buttonRef Container for Google's button.
 * @param {boolean} props.loading Disables the placeholder button.
 * @param {() => void} props.onUnavailable Called by the placeholder button.
 */
export function GoogleSignInButton({ buttonRef, loading, onUnavailable }) {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
    <div ref={buttonRef} aria-label="Continue with Google" />
  ) : (
    <button
      type="button"
      className="auth-google-login-btn"
      onClick={onUnavailable}
      disabled={loading}
    >
      <GoogleIcon />
      <span>Continue with Google</span>
    </button>
  );
}
