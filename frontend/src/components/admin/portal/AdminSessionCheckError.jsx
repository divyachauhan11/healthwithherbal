/**
 * Screen shown when the stored session could not be verified (service
 * unreachable): retry by reloading, or return to the sign-in form.
 * @param {object} props
 * @param {string} props.message Verification error.
 * @param {() => void} props.onReturnToSignIn
 */
export function AdminSessionCheckError({ message, onReturnToSignIn }) {
  return (
    <main className="admin-login-wrap">
      <section className="admin-login" role="alert">
        <span className="eyebrow">ADMIN PORTAL</span>
        <h1>Could not verify your session</h1>
        <p>{message}</p>
        <button className="primary" type="button" onClick={() => window.location.reload()}>
          Try again
        </button>
        <button
          className="admin-session-signout"
          type="button"
          onClick={onReturnToSignIn}
        >
          Return to sign in
        </button>
      </section>
    </main>
  );
}
