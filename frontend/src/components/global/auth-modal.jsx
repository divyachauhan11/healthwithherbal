"use client";
import { useState, useEffect } from "react";
import { X, Loader2, AlertCircle, Mail, CheckCircle2 } from "lucide-react";
import { GoogleIcon, AppleIcon } from "./icons";
import {
  requestLoginOtp,
  verifyLoginOtp,
  requestSignupOtp,
  verifySignupOtp,
  socialLogin,
} from "../../lib/api";

export function AuthModal({ isOpen, onClose, onSuccess }) {
  // Navigation views: "login" | "signup" | "otp"
  const [view, setView] = useState("login");
  // Tracks whether the current OTP verification belongs to "login" or "signup"
  const [authMode, setAuthMode] = useState("login");

  // Form states
  const [loginInput, setLoginInput] = useState(""); // Email or 10-digit phone
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // Feedback & security states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notRegistered, setNotRegistered] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");
  const [maskedTarget, setMaskedTarget] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  // ---------------------------------------------------------------------------
  // 1. Handle Login Submit (Checks MongoDB: strictly blocks if user not in DB!)
  // ---------------------------------------------------------------------------
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const cleanInput = (loginInput || "").trim();
    if (!cleanInput) {
      setError("Please enter your registered email address or mobile number.");
      return;
    }

    const isEmail = cleanInput.includes("@");
    if (!isEmail) {
      const cleanPhone = cleanInput.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        setError("Please enter a valid 10-digit mobile number or email address.");
        return;
      }
    }

    setLoading(true);
    setError("");
    setNotRegistered(false);

    try {
      const res = await requestLoginOtp(cleanInput);
      setAuthMode("login");
      setMaskedTarget(res.maskedEmail || res.email || cleanInput);
      setDevOtp(res.devOtp || "");
      setInfoMsg(
        res.message ||
          `Verification code sent to registered email (${res.maskedEmail || res.email}).`,
      );
      setResendCooldown(30);
      setView("otp");
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      setError(
        err.message ||
          "No account found with these details. Please create an account first.",
      );
      if (err.notRegistered || err.status === 404) {
        setNotRegistered(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 2. Handle Signup Submit (Validates and checks DB uniqueness)
  // ---------------------------------------------------------------------------
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    const cleanEmail = (email || "").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    const cleanPhone = (mobileNumber || "").replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await requestSignupOtp({
        name: fullName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
      });
      setAuthMode("signup");
      setMaskedTarget(res.maskedEmail || cleanEmail);
      setDevOtp(res.devOtp || "");
      setInfoMsg(
        res.message || `Verification code sent to ${res.maskedEmail || cleanEmail}.`,
      );
      setResendCooldown(30);
      setView("otp");
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      setError(err.message || "Could not proceed with registration.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 3. Handle OTP Verification (Stores user in MongoDB on signup; loads on login)
  // ---------------------------------------------------------------------------
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const entered = otp.join("").trim();
    if (entered.length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let authenticatedUser = null;
      if (authMode === "signup") {
        // STORE NEW USER IN MONGODB DATABASE
        authenticatedUser = await verifySignupOtp({
          name: fullName.trim(),
          email: email.trim(),
          phone: mobileNumber.replace(/\D/g, ""),
          otp: entered,
        });
      } else {
        // RETRIEVE VERIFIED USER FROM MONGODB DATABASE
        authenticatedUser = await verifyLoginOtp({
          identifier: loginInput.trim(),
          otp: entered,
        });
      }

      if (onSuccess) {
        onSuccess(authenticatedUser);
      }
      onClose();
    } catch (err) {
      setError(
        err.message ||
          "Verification failed. Please check your code or request a new one.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 4. Handle Social Login (Google / Apple)
  // ---------------------------------------------------------------------------
  const handleSocialAuth = async (provider) => {
    setLoading(true);
    setError("");
    try {
      const user = await socialLogin({
        name: `${provider} User`,
        email: "",
        provider: provider.toLowerCase(),
      });
      if (onSuccess) onSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || "Social sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 5. Handle Resend OTP
  // ---------------------------------------------------------------------------
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setLoading(true);
    try {
      if (authMode === "signup") {
        const res = await requestSignupOtp({
          name: fullName.trim(),
          email: email.trim(),
          phone: mobileNumber.replace(/\D/g, ""),
        });
        setDevOtp(res.devOtp || "");
      } else {
        const res = await requestLoginOtp(loginInput.trim());
        setDevOtp(res.devOtp || "");
      }
      setResendCooldown(30);
      setInfoMsg("A fresh verification code has been sent to your email.");
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      setError(err.message || "Failed to resend verification code.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 6. OTP Clipboard Paste & Keyboard handlers
  // ---------------------------------------------------------------------------
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasteData) return;
    const nextOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      nextOtp[i] = pasteData[i] || "";
    }
    setOtp(nextOtp);
    const nextFocusIdx = Math.min(pasteData.length, 5);
    document.getElementById(`otp-${nextFocusIdx}`)?.focus();
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="auth-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={19} />
        </button>

        {/* ================================================================= */}
        {/* VIEW 1: LOGIN (Strictly checks database before sending Brevo OTP) */}
        {/* ================================================================= */}
        {view === "login" && (
          <div className="auth-modal-content">
            <h2 className="auth-modal-title">Welcome Back!</h2>
            <p className="auth-modal-sub">
              Log in to your account with a secure email verification code.
            </p>

            <form onSubmit={handleLoginSubmit} className="auth-form">
              <label className="auth-label">
                <span>
                  Email or Mobile Number <span className="required-star">*</span>
                </span>
                <input
                  type="text"
                  required
                  placeholder="Enter email or 10-digit mobile"
                  value={loginInput}
                  onChange={(e) => {
                    setLoginInput(e.target.value);
                    setError("");
                    setNotRegistered(false);
                  }}
                  className="auth-input"
                  autoFocus
                  disabled={loading}
                />
              </label>

              {error && (
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
                      style={{ color: "#dc2626", flexShrink: 0, marginTop: "2px" }}
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
                          onClick={() => {
                            setError("");
                            setNotRegistered(false);
                            // Pre-fill email or phone in signup if applicable
                            if (loginInput.includes("@")) {
                              setEmail(loginInput);
                            } else {
                              setMobileNumber(loginInput.replace(/\D/g, ""));
                            }
                            setView("signup");
                          }}
                        >
                          Click here to Create an Account &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Loader2 size={16} className="spin-animate" /> Sending code...
                  </span>
                ) : (
                  "Get Verification Code"
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            <div className="auth-social-row">
              <button
                type="button"
                className="auth-social-btn"
                onClick={() => handleSocialAuth("Google")}
                disabled={loading}
                aria-label="Continue with Google"
              >
                <GoogleIcon />
              </button>
              <button
                type="button"
                className="auth-social-btn"
                onClick={() => handleSocialAuth("Apple")}
                disabled={loading}
                aria-label="Continue with Apple"
              >
                <AppleIcon />
              </button>
            </div>

            <p className="auth-toggle-note">
              New to Health with Herbal?{" "}
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setNotRegistered(false);
                  setView("signup");
                }}
                className="auth-link-btn"
              >
                Create an account
              </button>
            </p>

            <p className="auth-terms-note">
              By continuing, you agree to our{" "}
              <a href="#terms" onClick={(e) => e.preventDefault()}>
                Terms of Service
              </a>
              .
            </p>

            <div className="auth-secured-by">
              <span>Secured by</span>
              <strong className="secured-brand">HEALTH WITH HERBAL &bull; BREVO</strong>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 2: SIGN UP (Creates and stores user in MongoDB database)     */}
        {/* ================================================================= */}
        {view === "signup" && (
          <div className="auth-modal-content">
            <h2 className="auth-modal-title">Create Account</h2>
            <p className="auth-modal-sub">
              Join 25,000+ lovers of pure Ayurvedic rituals.
            </p>

            <form onSubmit={handleSignupSubmit} className="auth-form">
              <label className="auth-label">
                <span>
                  Full Name <span className="required-star">*</span>
                </span>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
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
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  disabled={loading}
                />
                <span style={{ fontSize: "11px", color: "#64748b", marginTop: "-3px" }}>
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
                  onChange={(e) => {
                    setMobileNumber(
                      e.target.value.replace(/\D/g, "").slice(0, 10),
                    );
                    setError("");
                  }}
                  className="auth-input"
                  disabled={loading}
                />
              </label>

              {error && (
                <div className="auth-error-box">
                  <p className="auth-error-msg">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Loader2 size={16} className="spin-animate" /> Sending code...
                  </span>
                ) : (
                  "Sign Up & Get Code"
                )}
              </button>
            </form>

            <p className="auth-toggle-note" style={{ marginTop: "16px" }}>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setView("login");
                }}
                className="auth-link-btn"
              >
                Log In
              </button>
            </p>

            <p className="auth-terms-note">
              By signing up, you agree to our{" "}
              <a href="#terms" onClick={(e) => e.preventDefault()}>
                Terms of Service
              </a>{" "}
              and Privacy Policy.
            </p>

            <div className="auth-secured-by">
              <span>Secured by</span>
              <strong className="secured-brand">HEALTH WITH HERBAL &bull; BREVO</strong>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 3: OTP VERIFICATION (Brevo Email Code Verification)           */}
        {/* ================================================================= */}
        {view === "otp" && (
          <div className="auth-modal-content">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#f4f8f5",
                color: "var(--forest)",
                marginBottom: "12px",
                border: "1px solid #d9e6dd",
              }}
            >
              <Mail size={22} />
            </div>

            <h2 className="auth-modal-title">Check Your Email</h2>
            <p className="auth-modal-sub" style={{ marginBottom: "14px" }}>
              We sent a 6-digit verification code to
              <br />
              <strong style={{ color: "#1c3629", fontSize: "14px" }}>
                {maskedTarget || "your email"}
              </strong>
            </p>

            {infoMsg && (
              <div
                className="auth-info-banner"
                style={{
                  background: "#fbf6ee",
                  border: "1px solid #ebdccb",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#6a4a2b",
                  marginBottom: "14px",
                  textAlign: "center",
                }}
              >
                {infoMsg}
              </div>
            )}

            {devOtp && (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px dashed #86efac",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  fontSize: "11.5px",
                  color: "#166534",
                  marginBottom: "14px",
                  textAlign: "center",
                }}
              >
                ⚡ <strong>Dev Mode Preview:</strong> Code is <code>{devOtp}</code>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="auth-form">
              <div className="auth-otp-row">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    className="auth-otp-box"
                    value={otp[idx]}
                    onPaste={handleOtpPaste}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      const nextOtp = [...otp];
                      nextOtp[idx] = val ? val.slice(-1) : "";
                      setOtp(nextOtp);
                      if (val && idx < 5) {
                        const nextBox = document.getElementById(
                          `otp-${idx + 1}`,
                        );
                        nextBox?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[idx] && idx > 0) {
                        const prevBox = document.getElementById(
                          `otp-${idx - 1}`,
                        );
                        prevBox?.focus();
                      }
                    }}
                    autoFocus={idx === 0}
                    disabled={loading}
                  />
                ))}
              </div>

              {error && (
                <div className="auth-error-box" style={{ marginBottom: "10px" }}>
                  <p className="auth-error-msg">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Loader2 size={16} className="spin-animate" />{" "}
                    {authMode === "signup"
                      ? "Creating Account in DB..."
                      : "Verifying..."}
                  </span>
                ) : (
                  "Verify & Continue"
                )}
              </button>
            </form>

            <div className="auth-otp-resend">
              <span>Didn&apos;t receive the email?</span>
              {resendCooldown > 0 ? (
                <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>
                  Resend in {resendCooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={handleResendOtp}
                  disabled={loading}
                >
                  Resend Code
                </button>
              )}
            </div>

            <button
              type="button"
              className="auth-back-link"
              onClick={() => {
                setError("");
                setView(authMode);
              }}
              disabled={loading}
            >
              &larr; Change email or mobile number
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
