"use client";
import { X } from "lucide-react";
import {
  LoginStep,
  OtpStep,
  SignupStep,
  useAuthFlow,
} from "@/components/pages/auth";

/**
 * Customer login / signup modal (emailed one-time code or Google sign-in).
 * Stays mounted while closed so the flow state is kept between openings.
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {(user: object) => void} [props.onSuccess] Receives the signed-in user.
 */
export function AuthModal({ isOpen, onClose, onSuccess }) {
  const auth = useAuthFlow({ isOpen, onClose, onSuccess });

  if (!isOpen) return null;

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

        {auth.view === "login" && (
          <LoginStep
            loginInput={auth.loginInput}
            error={auth.error}
            notRegistered={auth.notRegistered}
            loading={auth.loading}
            googleButtonRef={auth.googleButtonRef}
            onLoginInputChange={auth.changeLoginInput}
            onSubmit={auth.handleLoginSubmit}
            onCreateAccount={auth.createAccountFromLogin}
            onShowSignup={auth.showSignup}
            onGoogleUnavailable={auth.reportGoogleUnavailable}
          />
        )}

        {auth.view === "signup" && (
          <SignupStep
            fullName={auth.fullName}
            email={auth.email}
            mobileNumber={auth.mobileNumber}
            error={auth.error}
            loading={auth.loading}
            onFullNameChange={auth.changeFullName}
            onEmailChange={auth.changeEmail}
            onMobileNumberChange={auth.changeMobileNumber}
            onSubmit={auth.handleSignupSubmit}
            onShowLogin={auth.showLogin}
          />
        )}

        {auth.view === "otp" && (
          <OtpStep
            authMode={auth.authMode}
            maskedTarget={auth.maskedTarget}
            infoMsg={auth.infoMsg}
            devOtp={auth.devOtp}
            otp={auth.otp}
            error={auth.error}
            loading={auth.loading}
            resendCooldown={auth.resendCooldown}
            onDigitChange={auth.changeOtpDigit}
            onDigitKeyDown={auth.handleOtpKeyDown}
            onPaste={auth.handleOtpPaste}
            onSubmit={auth.handleVerifyOtp}
            onResend={auth.handleResendOtp}
            onBack={auth.backToDetails}
          />
        )}
      </div>
    </div>
  );
}
