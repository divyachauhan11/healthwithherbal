"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, LoaderCircle, Mail } from "lucide-react";
import { FormField } from "@/components/shared/FormField";
import "./theme.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ForgotPasswordForm({
  onSubmit,
  onBackToLogin,
  loginHref = "/login",
  brandLogo,
  title = "Forgot your password?",
  subtitle = "Enter the email address associated with your account and we’ll send you a password reset link.",
  submitButtonText = "Send reset link",
  resendCooldownSeconds = 60,
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("default");
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (status !== "success" || secondsLeft <= 0) return undefined;
    const timer = window.setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [status, secondsLeft]);

  const submit = async (event) => {
    event?.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setStatus("default");
      setError("Enter a valid email address.");
      return;
    }
    if (status === "loading" || (status === "success" && secondsLeft > 0)) return;

    setError("");
    setStatus("loading");
    try {
      await onSubmit(normalizedEmail);
      setEmail(normalizedEmail);
      setSecondsLeft(Math.max(0, Number(resendCooldownSeconds) || 0));
      setStatus("success");
    } catch (submitError) {
      setError(submitError?.message || "We couldn’t process your request. Please try again.");
      setStatus("error");
    }
  };

  const backControl = onBackToLogin ? (
    <button type="button" onClick={onBackToLogin} className="fp-back" disabled={status === "loading"}>
      <ArrowLeft size={15} aria-hidden="true" />
      Back to login
    </button>
  ) : (
    <Link href={loginHref} className="fp-back">
      <ArrowLeft size={15} aria-hidden="true" />
      Back to login
    </Link>
  );

  return (
    <main className="fp-page">
      <section className="fp-card" aria-live="polite">
        {brandLogo && <div className="fp-brand">{typeof brandLogo === "string" ? <img src={brandLogo} alt="Brand" /> : brandLogo}</div>}

        {status === "success" ? (
          <div className="fp-success" role="status">
            <div className="fp-success-icon"><Check size={24} aria-hidden="true" /></div>
            <span className="fp-eyebrow">ACCOUNT RECOVERY</span>
            <h1 className="fp-title">Check your email</h1>
            <p className="fp-subtitle">
              If an account exists for this address, we’ve sent a secure reset link.
            </p>
            <div className="fp-email-chip"><Mail size={17} aria-hidden="true" /><strong>{email}</strong></div>
            <p className="fp-delivery-note">Check your inbox and spam folder. The link expires in 30 minutes.</p>
            <div className="fp-resend-wrap">
              <button type="button" onClick={submit} disabled={secondsLeft > 0 || status === "loading"} className="fp-button fp-button-full">
                {secondsLeft > 0 ? <>Resend link <span className="fp-countdown">Available in {secondsLeft}s</span></> : "Resend reset link"}
              </button>
              {secondsLeft > 0 && (
                <div className="fp-cooldown-track" aria-hidden="true">
                  <span style={{ width: `${Math.min(100, Math.max(0, ((Number(resendCooldownSeconds) - secondsLeft) / Math.max(1, Number(resendCooldownSeconds))) * 100))}%` }} />
                </div>
              )}
            </div>
            <div className="fp-footer">{backControl}</div>
          </div>
        ) : (
          <>
            <span className="fp-eyebrow">ADMIN PORTAL</span>
            <h1 className="fp-title">{title}</h1>
            <p className="fp-subtitle">{subtitle}</p>
            {error && <div className="fp-error" role="alert">{error}</div>}
            <form onSubmit={submit} noValidate>
              <FormField
                variant="auth-email"
                id="forgot-password-email"
                label="Email address"
                className="fp-email-field"
              >
                <Mail className="fp-email-icon" size={18} aria-hidden="true" />
                <input
                  id="forgot-password-email"
                  className="fp-input fp-email-input"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => { setEmail(event.target.value); if (error) setError(""); }}
                  disabled={status === "loading"}
                  required
                />
              </FormField>
              <button type="submit" className="fp-button fp-button-full" disabled={status === "loading"}>
                {status === "loading" ? <><LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> Sending…</> : submitButtonText}
              </button>
            </form>
            <div className="fp-footer">{backControl}</div>
          </>
        )}
      </section>
    </main>
  );
}
