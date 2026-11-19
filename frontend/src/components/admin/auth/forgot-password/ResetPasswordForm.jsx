"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Eye, EyeOff, KeyRound, LoaderCircle } from "lucide-react";
import { apiPost } from "@/lib/api-client";
import { FormField } from "@/components/shared/FormField";
import "./theme.css";

export default function ResetPasswordForm({ token = "", email = "" }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("default");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (password.length < 8 || password.length > 128) {
      setStatus("error");
      setError("Your password must be between 8 and 128 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("error");
      setError("The passwords do not match.");
      return;
    }
    setError("");
    setStatus("loading");
    try {
      await apiPost("/admin/auth/reset-password", { email, token, password });
      setStatus("success");
      setPassword("");
      setConfirmPassword("");
    } catch (requestError) {
      setError(requestError?.message || "Could not reset your password. Request a new link and try again.");
      setStatus("error");
    }
  };

  const hasResetLink = Boolean(token && email);

  return (
    <main className="fp-page min-h-screen bg-[var(--fp-bg-page)] px-5 py-8 text-[var(--fp-text-primary)]">
      <section className="fp-card w-full max-w-md rounded-[var(--fp-radius-card)] border border-[var(--fp-border)] bg-[var(--fp-bg-card)] p-8 shadow-xl sm:p-10">
        <div className="fp-brand"><img src="/admin-login-logo-clean.png" alt="Health With Herbal" /></div>
        {status === "success" ? (
          <div role="status">
            <div className="fp-success-icon"><Check size={24} aria-hidden="true" /></div>
            <h1 className="fp-title text-3xl font-bold">Password updated</h1>
            <p className="fp-subtitle text-[var(--fp-text-muted)]">Your password has been reset. Sign in with your new password.</p>
            <Link href="/admin" className="fp-button fp-button-full w-full bg-[var(--fp-primary)]">Back to admin login</Link>
          </div>
        ) : !hasResetLink ? (
          <div>
            <h1 className="fp-title text-3xl font-bold">Reset link unavailable</h1>
            <p className="fp-subtitle text-[var(--fp-text-muted)]">This link is incomplete. Request a new password reset link.</p>
            <Link href="/forgot-password" className="fp-button fp-button-full w-full bg-[var(--fp-primary)]">Request a new link</Link>
          </div>
        ) : (
          <>
            <span className="fp-eyebrow">ADMIN PORTAL · SECURE RESET</span>
            <h1 className="fp-title text-3xl font-bold">Set a new password</h1>
            <p className="fp-subtitle text-[var(--fp-text-muted)]">Choose a new password for your admin account.</p>
            {error && <div className="fp-error bg-[var(--fp-error-bg)] text-[var(--fp-error-text)]" role="alert">{error}</div>}
            <form onSubmit={submit}>
              <FormField
                variant="auth-password"
                id="reset-password"
                label="New password"
                className="fp-reset-field"
              >
                <div className="fp-password-wrap">
                  <KeyRound className="fp-password-icon" size={17} aria-hidden="true" />
                  <input
                    id="reset-password"
                    className="fp-input fp-password-input"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={128}
                    value={password}
                    onChange={(event) => { setPassword(event.target.value); if (error) setError(""); }}
                    disabled={status === "loading"}
                    required
                  />
                  <button type="button" className="fp-password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide new password" : "Show new password"} aria-pressed={showPassword} disabled={status === "loading"}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className={`fp-password-hint${password.length >= 8 ? " is-valid" : ""}`}>
                  <Check size={14} aria-hidden="true" /> Use at least 8 characters
                </div>
              </FormField>

              <FormField
                variant="auth-password"
                id="confirm-reset-password"
                label="Confirm new password"
                className="fp-reset-field fp-reset-field-confirm"
              >
                <div className="fp-password-wrap">
                  <KeyRound className="fp-password-icon" size={17} aria-hidden="true" />
                  <input
                    id="confirm-reset-password"
                    className="fp-input fp-password-input"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={128}
                    value={confirmPassword}
                    onChange={(event) => { setConfirmPassword(event.target.value); if (error) setError(""); }}
                    disabled={status === "loading"}
                    required
                  />
                  <button type="button" className="fp-password-toggle" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"} aria-pressed={showConfirmPassword} disabled={status === "loading"}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && (
                  <div className={`fp-password-hint${confirmPassword === password ? " is-valid" : " is-invalid"}`} aria-live="polite">
                    <Check size={14} aria-hidden="true" /> {confirmPassword === password ? "Passwords match" : "Passwords do not match"}
                  </div>
                )}
              </FormField>

              <button type="submit" className="fp-button fp-button-full w-full bg-[var(--fp-primary)]" disabled={status === "loading"}>
                {status === "loading" ? <><LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> Updating…</> : "Reset password"}
              </button>
            </form>
            <div className="fp-footer"><Link href="/admin" className="fp-back text-sm">Back to login</Link></div>
          </>
        )}
      </section>
    </main>
  );
}
