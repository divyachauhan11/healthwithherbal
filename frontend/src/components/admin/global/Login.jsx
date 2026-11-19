import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

export function Login({ onLogin, busy, error }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="admin-login-wrap">
      <form className="admin-login" onSubmit={onLogin}>
        <div className="admin-login-logo-card">
          <img
            src="/admin-login-logo-clean.png"
            alt="Health With Herbal"
            className="admin-login-logo-img"
          />
        </div>
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
        <label>
          Password
          <span className="admin-login-password-field">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              className="admin-login-password-toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>
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
