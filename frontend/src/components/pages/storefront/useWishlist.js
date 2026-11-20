"use client";
import { useEffect, useState } from "react";
import {
  addUserWishlistItem,
  fetchUserWishlist,
  removeUserWishlistItem,
} from "@/lib/api";

/**
 * Owns the signed-in customer's wishlist (product IDs saved on the server).
 * The list reloads when the session is restored or the account changes and is
 * emptied on every sign-in and sign-out, so this hook also provides the
 * session handlers that do that before calling `session.signIn/signOut`.
 * @param {object} options
 * @param {{currentUser: object|null, sessionReady: boolean, signIn: Function, signOut: Function}} options.session
 *   Result of `useCustomerSession`.
 * @param {(message: string) => void} options.notify
 * @param {() => void} options.openAuthModal Shown when a guest tries to save a product.
 * @returns {{
 *   wishlist: Array<string|number>,
 *   toggleWish: (id: string|number) => Promise<void>,
 *   handleAuthSuccess: (user: object) => void,
 *   handleLogout: () => void,
 * }}
 */
export function useWishlist({ session, notify, openAuthModal }) {
  const { currentUser, sessionReady, signIn, signOut } = session;
  const [wishlist, setWishlist] = useState([]);

  const handleAuthSuccess = (user) => {
    setWishlist([]);
    signIn(user);
  };

  const handleLogout = () => {
    setWishlist([]);
    signOut();
  };

  useEffect(() => {
    if (!sessionReady) return;
    let active = true;
    setWishlist([]);
    if (currentUser) {
      fetchUserWishlist()
        .then((items) => { if (active) setWishlist(items); })
        .catch((error) => {
          if (!active) return;
          if (error.status === 401 || /sign in|session|account is unavailable/i.test(error.message)) {
            handleLogout();
            return;
          }
          console.warn("Could not load account wishlist:", error);
          notify(error.message || "Could not load your wishlist. Please try again.");
        });
    }
    return () => { active = false; };
    // Reload only when the session is restored or the signed-in account changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionReady, currentUser?._id]);

  const toggleWish = async (id) => {
    if (!currentUser) { openAuthModal(); return; }
    const isSaved = wishlist.some((item) => String(item) === String(id));
    try {
      if (isSaved) await removeUserWishlistItem(id);
      else await addUserWishlistItem(id);
      setWishlist((current) => isSaved
        ? current.filter((item) => String(item) !== String(id))
        : [...current, id]);
      notify(isSaved ? "Removed from wishlist" : "Saved to wishlist");
    } catch (error) {
      notify(error.message || "Could not update wishlist");
    }
  };

  return { wishlist, toggleWish, handleAuthSuccess, handleLogout };
}
