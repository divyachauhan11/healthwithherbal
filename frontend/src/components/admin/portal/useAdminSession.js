"use client";

import { useEffect, useState } from "react";
import {
  ADMIN_SESSION_INVALID_EVENT,
  fetchAdminSession,
  loginAdmin,
} from "../../../lib/admin-api";
import {
  clearAdminPortalState,
  getAdminSessionToken,
  getAdminUser,
  saveAdminSession,
  saveAdminUser,
} from "../../../lib/session";
import { clearStoredAdminSession, getLoginErrorMessage } from "./admin-portal-utils";

/**
 * Owns the admin session: restores it from storage, returns to sign-in on
 * `ADMIN_SESSION_INVALID_EVENT`, re-validates it (and refreshes the user's
 * access) immediately and every 15 s, and handles sign-in and sign-out.
 * @param {object} options
 * @param {boolean} options.busy Shared portal busy flag (blocks double sign-in).
 * @param {(busy: boolean) => void} options.setBusy
 * @param {(message: string, type?: string) => void} options.notify Shows a toast.
 * @param {(page: string) => void} options.setPage Opens an employee's first page after sign-in.
 * @returns {{
 *   token: string, user: object|null, sessionReady: boolean, sessionCheckError: string, loginError: string,
 *   login: (event: SubmitEvent) => Promise<void>, expireSession: (message: string) => void,
 *   returnToSignIn: () => void, signOut: () => void, updateUser: (user: object) => void,
 * }}
 */
export function useAdminSession({ busy, setBusy, notify, setPage }) {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionCheckError, setSessionCheckError] = useState("");
  const [loginError, setLoginError] = useState("");

  // Restore the stored session.
  useEffect(() => {
    try {
      const saved = getAdminSessionToken();
      if (saved) {
        setToken(saved);
        setUser(
          JSON.parse(getAdminUser() || "null"),
        );
      } else {
        setSessionReady(true);
      }
    } catch {
      clearStoredAdminSession();
      setToken("");
      setUser(null);
      setSessionReady(true);
    }
  }, []);

  // Any admin request answered with 401 ends the session.
  useEffect(() => {
    const handleInvalidSession = (event) => {
      clearStoredAdminSession();
      setToken("");
      setUser(null);
      setSessionReady(true);
      setSessionCheckError("");
      setLoginError(event.detail?.message || "Your admin session is no longer valid. Please sign in again.");
    };
    window.addEventListener(ADMIN_SESSION_INVALID_EVENT, handleInvalidSession);
    return () => window.removeEventListener(ADMIN_SESSION_INVALID_EVENT, handleInvalidSession);
  }, []);

  // Verify the session now and every 15 s.
  useEffect(() => {
    if (!token) {
      return undefined;
    }
    let active = true;
    let hasValidatedSession = false;
    const refreshStaffAccess = async () => {
      try {
        const result = await fetchAdminSession(token);
        if (!active) return;
        if (!result?.user) throw new Error("The admin session service did not return a valid user.");
        setUser(result.user);
        try {
          saveAdminUser(result.user);
        } catch {
          // The verified in-memory session can continue if browser storage is blocked.
        }
        hasValidatedSession = true;
        setSessionCheckError("");
      } catch (error) {
        if (!active) return;
        if (error.status !== 401 && !hasValidatedSession) {
          setSessionCheckError(error.message || "Could not reach the admin session service.");
        }
      } finally {
        if (active) setSessionReady(true);
      }
    };
    refreshStaffAccess();
    const intervalId = window.setInterval(refreshStaffAccess, 15000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [token]);

  /** Sign-in form submit handler. */
  const login = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setLoginError("");
    try {
      const formData = new FormData(event.currentTarget);
      const result = await loginAdmin({
        email: String(formData.get("email") || "").trim().toLowerCase(),
        password: formData.get("password"),
      });
      if (!result?.token || !result?.user || !result.user.role) {
        throw new Error("The sign-in service did not return a valid admin session. Please try again.");
      }
      let sessionSaved = true;
      try {
        saveAdminSession(result.token, result.user);
      } catch {
        sessionSaved = false;
        clearStoredAdminSession();
      }
      setUser(result.user);
      setToken(result.token);
      setSessionReady(true);
      setSessionCheckError("");
      if (!sessionSaved) {
        notify("Signed in, but this browser could not save the session. You may need to sign in again after refreshing.", "error");
      }
      if (result.user.role === "employee") {
        setPage(result.user.pageAccess?.[0] || "Products");
      }
    } catch (error) {
      console.error("Admin sign-in failed:", error);
      setLoginError(getLoginErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  /** Drop an expired session and show `message` on the sign-in screen. */
  const expireSession = (message) => {
    clearStoredAdminSession();
    setToken("");
    setUser(null);
    setLoginError(message);
  };

  /** Leave the "could not verify your session" screen for a clean sign-in. */
  const returnToSignIn = () => {
    clearStoredAdminSession();
    setToken("");
    setUser(null);
    setSessionCheckError("");
    setLoginError("");
  };

  /** Forget the session and the remembered portal state (sign-out). */
  const signOut = () => {
    clearStoredAdminSession();
    try {
      clearAdminPortalState();
    } catch {
      // The local session is also cleared from memory below.
    }
    setToken("");
    setUser(null);
    setSessionReady(true);
    setSessionCheckError("");
  };

  /** Replace the signed-in user's profile after it was edited. */
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    saveAdminUser(updatedUser);
  };

  return {
    token,
    user,
    sessionReady,
    sessionCheckError,
    loginError,
    login,
    expireSession,
    returnToSignIn,
    signOut,
    updateUser,
  };
}
