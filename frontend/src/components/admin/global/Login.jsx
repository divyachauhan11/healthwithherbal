import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AdminLoginLogo, AdminPasswordField } from "./login";

/**
 * Admin sign-in screen.
 * @param {object} props
 * @param {(event: SubmitEvent) => void} props.onLogin Form submit handler (reads `email` and `password`).
 * @param {boolean} props.busy Shows "Signing in…" and disables submit.
 * @param {string} [props.error] Sign-in error message.
 */
export function Login({ onLogin, busy, error }) {
  return (
    <main className="admin-login-wrap">
      <form className="admin-login" onSubmit={onLogin}>
        <AdminLoginLogo />
        <span className="eyebrow">ADMIN PORTAL</span>
        <h1>Welcome back</h1>
        <p>Sign in to manage your store.</p>
        {error && <div className="admin-alert" role="alert" aria-live="assertive">{error}</div>}
        <label>
          Email address
          <input
            name="email"
            type="email"
            autoComplete="username"
            placeholder="admin@yourstore.com"
            required
          />
        </label>
        <AdminPasswordField />
        <div className="admin-login-forgot-password">
          <Link href="/forgot-password">Forgot password?</Link>
        </div>
        <button className="primary" disabled={busy}>
          {busy ? "Signing in…" : "Sign in to admin"}
          <ArrowRight size={16} />
        </button>
        <small>Your session is secured and expires after 8 hours.</small>
      </form>
    </main>
  );
}
