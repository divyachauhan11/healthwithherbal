"use client";

import { useState } from "react";

/**
 * Owns the sign-out confirmation: open/close state and the confirmed sign-out
 * (clears the session, resets navigation and strips the URL query).
 * @param {object} options
 * @param {() => void} options.signOut Clears the stored and in-memory session.
 * @param {() => void} options.resetNavigation Returns to the unfiltered dashboard.
 * @returns {{isOpen: boolean, open: () => void, close: () => void, confirm: () => void}}
 */
export function useAdminLogout({ signOut, resetNavigation }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const logout = () => {
    signOut();
    resetNavigation();
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname);
    }
  };

  return {
    isOpen: showLogoutConfirm,
    open: () => setShowLogoutConfirm(true),
    close: () => setShowLogoutConfirm(false),
    confirm: () => {
      setShowLogoutConfirm(false);
      logout();
    },
  };
}
