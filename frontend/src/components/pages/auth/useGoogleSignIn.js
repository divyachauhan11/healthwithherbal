import { useEffect, useRef } from "react";
import { socialLogin } from "@/lib/api";

/**
 * Own Google sign-in for the auth modal: while the modal is open on the login
 * step and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set, load the Google Identity
 * Services script (once), render Google's button into the returned ref and
 * sign the customer in with the credential it returns.
 * @param {object} options
 * @param {boolean} options.isOpen Modal visibility.
 * @param {string} options.view Current auth step; the button only renders on "login".
 * @param {() => void} options.onClose Closes the modal after signing in.
 * @param {(user: object) => void} [options.onSuccess] Receives the signed-in user.
 * @param {(message: string) => void} options.setError Shows an error in the login step.
 * @param {(loading: boolean) => void} options.setLoading Flags the sign-in request.
 * @returns {import("react").RefObject<HTMLDivElement>} Container for Google's button.
 */
export function useGoogleSignIn({ isOpen, view, onClose, onSuccess, setError, setLoading }) {
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
  }, [isOpen, view, onClose, onSuccess, setError, setLoading]);

  return googleButtonRef;
}
