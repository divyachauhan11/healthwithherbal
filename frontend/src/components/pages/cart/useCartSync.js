"use client";
import { useEffect, useRef } from "react";
import { syncCartWithBackend } from "@/lib/api";
import { getCartSessionId } from "@/lib/session";
import { CART_SYNC_DELAY_MS, toCartSyncItems } from "./cart-utils";

/**
 * Debounced background sync of the drawer's cart (items, order note and
 * coupon code) to the backend cart session. Failures are only logged.
 * @param {object} options
 * @param {Array<string|number>} options.cart Cart product IDs (one per unit).
 * @param {object[]} options.lineItems Drawer line items built from the cart.
 * @param {string} options.orderNote Order instructions.
 * @param {object|null} options.appliedCoupon Applied coupon, if any.
 * @returns {void}
 */
export function useCartSync({ cart, lineItems, orderNote, appliedCoupon }) {
  const syncTimeoutRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sessionId = getCartSessionId("cartDrawer");

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      syncCartWithBackend({
        sessionId,
        items: toCartSyncItems(lineItems),
        orderNote,
        couponCode: appliedCoupon?.code || "",
      }).catch((err) => {
        console.warn("Background cart sync failed:", err.message);
      });
    }, CART_SYNC_DELAY_MS);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [cart, orderNote, appliedCoupon, lineItems]);
}
