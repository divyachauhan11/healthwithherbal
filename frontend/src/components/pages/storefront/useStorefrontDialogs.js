"use client";
import { useState } from "react";

/**
 * Owns the open state of the cart drawer and the sign-in modal.
 * @returns {{
 *   cartOpen: boolean, setCartOpen: Function, openCart: () => void, closeCart: () => void,
 *   authModalOpen: boolean, setAuthModalOpen: Function, openAuthModal: () => void, closeAuthModal: () => void,
 * }} `setCartOpen` / `setAuthModalOpen` are the raw (stable) state setters.
 */
export function useStorefrontDialogs() {
  const [cartOpen, setCartOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return {
    cartOpen,
    setCartOpen,
    openCart: () => setCartOpen(true),
    closeCart: () => setCartOpen(false),
    authModalOpen,
    setAuthModalOpen,
    openAuthModal: () => setAuthModalOpen(true),
    closeAuthModal: () => setAuthModalOpen(false),
  };
}
