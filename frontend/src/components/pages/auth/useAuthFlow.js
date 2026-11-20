import { useEffect, useRef, useState } from "react";
import {
  requestLoginOtp,
  verifyLoginOtp,
  requestSignupOtp,
  verifySignupOtp,
  socialLogin,
} from "@/lib/api";
import {
  digitsOnly,
  emptyOtp,
  focusOtpBox,
  otpFromPaste,
  validateLoginIdentifier,
  validateSignupDetails,
} from "./auth-utils";

/**
 * Own the customer auth modal flow: login or signup details, the emailed
 * one-time code (with resend cooldown) and Google sign-in. State survives
 * closing the modal, like before.
 * @param {object} options
 * @param {boolean} options.isOpen Modal visibility.
 * @param {() => void} options.onClose Closes the modal.
 * @param {(user: object) => void} [options.onSuccess] Receives the signed-in user.
 * @returns {{
 *   view: "login"|"signup"|"otp",
 *   authMode: "login"|"signup",
 *   loginInput: string,
 *   fullName: string,
 *   email: string,
 *   mobileNumber: string,
 *   otp: string[],
 *   loading: boolean,
 *   error: string,
 *   notRegistered: boolean,
 *   infoMsg: string,
 *   maskedTarget: string,
 *   devOtp: string,
 *   resendCooldown: number,
 *   googleButtonRef: import("react").RefObject<HTMLDivElement>,
 *   handleLoginSubmit: (event: import("react").FormEvent) => Promise<void>,
 *   handleSignupSubmit: (event: import("react").FormEvent) => Promise<void>,
 *   handleVerifyOtp: (event: import("react").FormEvent) => Promise<void>,
 *   handleResendOtp: () => Promise<void>,
 *   handleOtpPaste: (event: import("react").ClipboardEvent) => void,
 *   changeLoginInput: (value: string) => void,
 *   changeFullName: (value: string) => void,
 *   changeEmail: (value: string) => void,
 *   changeMobileNumber: (value: string) => void,
 *   changeOtpDigit: (index: number, value: string) => void,
 *   handleOtpKeyDown: (index: number, key: string) => void,
 *   createAccountFromLogin: () => void,
 *   showSignup: () => void,
 *   showLogin: () => void,
 *   backToDetails: () => void,
 *   reportGoogleUnavailable: () => void,
 * }}
 */
export function useAuthFlow({ isOpen, onClose, onSuccess }) {
  const [view, setView] = useState("login");
  const [authMode, setAuthMode] = useState("login");

  const [loginInput, setLoginInput] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState(emptyOtp);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notRegistered, setNotRegistered] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");
  const [maskedTarget, setMaskedTarget] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const googleButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen || view !== "login" || !googleButtonRef.current) return;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    let cancelled = false;
    const renderGoogleButton = () => {
      if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current)
        return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          if (!credential) {
            setError(
              "Google sign-in did not return a credential. Please try again.",
            );
            return;
          }
          setLoading(true);
          setError("");
          try {
            const user = await socialLogin(credential);
            onSuccess?.(user);
            onClose();
          } catch (err) {
            setError(err.message || "Google sign-in failed.");
          } finally {
            setLoading(false);
          }
        },
      });
      googleButtonRef.current.replaceChildren();
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: 260,
      });
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
    } else {
      let script = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]',
      );
      if (!script) {
        script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", renderGoogleButton);
      script.addEventListener(
        "error",
        () => setError("Could not load Google sign-in. Please try again."),
        { once: true },
      );
      return () => {
        cancelled = true;
        script.removeEventListener("load", renderGoogleButton);
      };
    }
    return () => {
      cancelled = true;
    };
  }, [isOpen, view, onClose, onSuccess]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const cleanInput = (loginInput || "").trim();
    const validationError = validateLoginIdentifier(cleanInput);
    if (validationError) {
      setError(validationError);
      return;
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
      setOtp(emptyOtp());
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

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPhone = digitsOnly(mobileNumber || "");
    const validationError = validateSignupDetails({ fullName, cleanEmail, cleanPhone });
    if (validationError) {
      setError(validationError);
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
        res.message ||
          `Verification code sent to ${res.maskedEmail || cleanEmail}.`,
      );
      setResendCooldown(30);
      setView("otp");
      setOtp(emptyOtp());
    } catch (err) {
      setError(err.message || "Could not proceed with registration.");
    } finally {
      setLoading(false);
    }
  };

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
        authenticatedUser = await verifySignupOtp({
          name: fullName.trim(),
          email: email.trim(),
          phone: digitsOnly(mobileNumber),
          otp: entered,
        });
      } else {
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

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setLoading(true);
    try {
      if (authMode === "signup") {
        const res = await requestSignupOtp({
          name: fullName.trim(),
          email: email.trim(),
          phone: digitsOnly(mobileNumber),
        });
        setDevOtp(res.devOtp || "");
      } else {
        const res = await requestLoginOtp(loginInput.trim());
        setDevOtp(res.devOtp || "");
      }
      setResendCooldown(30);
      setInfoMsg("A fresh verification code has been sent to your email.");
      setOtp(emptyOtp());
    } catch (err) {
      setError(err.message || "Failed to resend verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = otpFromPaste(e.clipboardData.getData("text"));
    if (!pasted) return;
    setOtp(pasted.digits);
    focusOtpBox(pasted.focusIndex);
  };

  const changeOtpDigit = (index, value) => {
    const val = digitsOnly(value);
    const nextOtp = [...otp];
    nextOtp[index] = val ? val.slice(-1) : "";
    setOtp(nextOtp);
    if (val && index < 5) focusOtpBox(index + 1);
  };

  const handleOtpKeyDown = (index, key) => {
    if (key === "Backspace" && !otp[index] && index > 0) focusOtpBox(index - 1);
  };

  const changeLoginInput = (value) => {
    setLoginInput(value);
    setError("");
    setNotRegistered(false);
  };

  const changeMobileNumber = (value) => {
    setMobileNumber(digitsOnly(value).slice(0, 10));
    setError("");
  };

  const createAccountFromLogin = () => {
    setError("");
    setNotRegistered(false);
    // Pre-fill email or phone in signup if applicable
    if (loginInput.includes("@")) {
      setEmail(loginInput);
    } else {
      setMobileNumber(digitsOnly(loginInput));
    }
    setView("signup");
  };

  const showSignup = () => {
    setError("");
    setNotRegistered(false);
    setView("signup");
  };

  const showLogin = () => {
    setError("");
    setView("login");
  };

  const backToDetails = () => {
    setError("");
    setView(authMode);
  };

  const reportGoogleUnavailable = () =>
    setError("Google sign-in is not configured yet.");

  return {
    view,
    authMode,
    loginInput,
    fullName,
    email,
    mobileNumber,
    otp,
    loading,
    error,
    notRegistered,
    infoMsg,
    maskedTarget,
    devOtp,
    resendCooldown,
    googleButtonRef,
    handleLoginSubmit,
    handleSignupSubmit,
    handleVerifyOtp,
    handleResendOtp,
    handleOtpPaste,
    changeLoginInput,
    changeFullName: setFullName,
    changeEmail: setEmail,
    changeMobileNumber,
    changeOtpDigit,
    handleOtpKeyDown,
    createAccountFromLogin,
    showSignup,
    showLogin,
    backToDetails,
    reportGoogleUnavailable,
  };
}
