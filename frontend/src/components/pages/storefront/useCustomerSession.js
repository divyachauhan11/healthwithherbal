"use client";
import { useEffect, useState } from "react";
import {
  clearCustomerSession,
  clearLegacyWishlist,
  getCustomerSession,
  saveCustomerSession,
} from "@/lib/session";

/**
 * Owns the signed-in customer: restores the saved session once on mount and
 * persists sign-in / sign-out.
 * @param {{notify: (message: string) => void}} options
 * @returns {{
 *   currentUser: object|null,
 *   sessionReady: boolean,
 *   signIn: (user: object) => void,
 *   signOut: () => void,
 * }} `sessionReady` turns true once the saved session has been read.
 */
export function useCustomerSession({ notify }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    try {
      const { user: stored, token } = getCustomerSession();
      clearLegacyWishlist();
      if (stored && token) {
        setCurrentUser(JSON.parse(stored));
      } else {
        clearCustomerSession();
      }
    } catch (e) {
      console.warn("Could not load stored user session:", e);
    } finally {
      setSessionReady(true);
    }
  }, []);

  const signIn = (user) => {
    setCurrentUser(user);
    try {
      if (user) {
        saveCustomerSession(user);
      }
    } catch {}
    notify(`Welcome back, ${user?.name || "Seeker"}!`);
  };

  const signOut = () => {
    setCurrentUser(null);
    try {
      clearCustomerSession();
    } catch {}
    notify("You have been signed out.");
  };

  return { currentUser, sessionReady, signIn, signOut };
}
