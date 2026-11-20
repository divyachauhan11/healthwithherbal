"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchCartFromBackend, syncCartWithBackend } from "@/lib/api";
import {
  getCartSessionId,
  getStoredCart,
  hasStoredCart,
  saveStoredCart,
} from "@/lib/session";
import {
  cartTotal,
  countCartUnits,
  expandCartLines,
  findCartProduct,
  limitCartToStock,
  normalizeCartIds,
  toCartLines,
} from "./cart-utils";

/**
 * Owns the shopping bag: the cart (one product ID per unit, capped by stock),
 * its local copy, restoring it on load (`?cart=` link, then the saved local
 * cart, then the backend cart) and the debounced (250 ms) backend sync, plus
 * the selected shipping option.
 * @param {object} options
 * @param {Array<object>} options.products Catalogue, used for stock limits and prices.
 * @param {(message: string) => void} options.notify
 * @param {(open: boolean) => void} options.setCartOpen Stable cart-drawer state setter.
 * @returns {{
 *   cart: Array<string|number>, total: number,
 *   shippingOption: object, setShippingOption: Function,
 *   updateCart: (updater: Array|Function) => void,
 *   addToCart: (id: string|number, quantity?: number) => void,
 *   removeFromCart: (id: string|number) => void,
 *   changeQuantity: (id: string|number, change: number) => void,
 * }}
 */
export function useCart({ products, notify, setCartOpen }) {
  const [cart, setCart] = useState([]);
  const cartRef = useRef([]);
  const [cartSessionId, setCartSessionId] = useState("");
  const [cartReady, setCartReady] = useState(false);
  const [shippingOption, setShippingOption] = useState({
    method: "standard",
    name: "Standard Shipping",
    price: 0,
    estimatedDays: "3-5 business days",
  });

  const updateCart = (updater) => {
    const requestedCart = typeof updater === "function" ? updater(cartRef.current) : updater;
    const nextCart = limitCartToStock(products, requestedCart);
    cartRef.current = nextCart;
    setCart(nextCart);
    try {
      saveStoredCart(nextCart);
    } catch (error) {
      console.warn("Could not save local cart:", error);
    }
  };

  // A PayU return page announces a paid order; empty the bag.
  useEffect(() => {
    const clearCartAfterOnlinePayment = () => updateCart([]);
    window.addEventListener("hwh-payment-order-complete", clearCartAfterOnlinePayment);
    return () => window.removeEventListener("hwh-payment-order-complete", clearCartAfterOnlinePayment);
    // Registered once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trim the bag whenever the catalogue's stock levels no longer cover it.
  useEffect(() => {
    if (!products.length || !cart.length) return;
    const withinStock = limitCartToStock(products, cart);
    if (withinStock.length !== cart.length) {
      updateCart(withinStock);
      notify("Your bag was updated to match current stock levels");
    }
    // Runs only when the catalogue or the cart changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, cart]);

  // Restore the bag: a `?cart=` link wins, then the saved local cart, then the backend cart.
  useEffect(() => {
    let active = true;
    const sessionId = getCartSessionId("storefront");
    setCartSessionId(sessionId);

    const queryCart = new URLSearchParams(window.location.search).get("cart");
    const queryIds = queryCart ? normalizeCartIds(queryCart.split(",")) : [];
    const hasLocalCart = hasStoredCart();
    let localIds = [];
    try {
      localIds = normalizeCartIds(getStoredCart());
    } catch (error) {
      console.warn("Could not restore local cart:", error);
    }

    const preferredIds = queryIds.length ? queryIds : hasLocalCart ? localIds : null;
    if (preferredIds) {
      cartRef.current = preferredIds;
      setCart(preferredIds);
    }

    const restore = async () => {
      try {
        if (!preferredIds) {
          const result = await fetchCartFromBackend(sessionId);
          const restoredIds = expandCartLines(result?.items);
          if (active && cartRef.current.length === 0 && restoredIds.length > 0) {
            cartRef.current = restoredIds;
            setCart(restoredIds);
          }
        }
      } catch (error) {
        console.warn("Could not restore cart from database:", error);
      } finally {
        if (active) setCartReady(true);
      }
    };
    restore();
    return () => { active = false; };
  }, []);

  // Mirror the bag to the backend cart, debounced by 250 ms, once it is restored.
  useEffect(() => {
    if (!cartReady || !cartSessionId) return;
    const items = toCartLines(cart);
    const timeout = window.setTimeout(() => {
      syncCartWithBackend({ sessionId: cartSessionId, items })
        .catch((error) => console.warn("Background cart sync failed:", error.message));
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [cart, cartReady, cartSessionId]);

  const total = useMemo(() => cartTotal(cart, products), [cart, products]);

  const addToCart = (id, quantity = 1) => {
    const product = findCartProduct(products, id);
    const stock = Number(product?.stockQty);
    const inCart = countCartUnits(cartRef.current, id);
    if (product?.stockQty != null && Number.isFinite(stock)) {
      const remaining = Math.max(0, stock - inCart);
      const requested = Math.max(1, Math.floor(Number(quantity) || 1));
      if (remaining < requested) {
        notify(remaining > 0
          ? `Only ${remaining} more available for this product`
          : "This product has reached its available stock limit");
        setCartOpen(true);
        return;
      }
    }
    if (cart.includes(id)) {
      setCartOpen(true);
      notify("This product is already in your bag");
      return;
    }
    updateCart((current) => [...current, ...Array(quantity).fill(id)]);
    notify(
      quantity > 1
        ? `${quantity} products added to your bag`
        : "Added to your bag",
    );
  };

  const removeFromCart = (id) =>
    updateCart((current) => current.filter((item) => String(item) !== String(id)));

  const changeQuantity = (id, change) => {
    const currentQuantity = countCartUnits(cartRef.current, id);
    const product = findCartProduct(products, id);
    const stock = Number(product?.stockQty);
    if (change > 0 && product?.stockQty != null && Number.isFinite(stock) && currentQuantity >= stock) {
      notify("You have reached the available stock limit for this product");
      return;
    }
    updateCart((current) => {
      if (change > 0) return [...current, id];
      const index = current.findLastIndex((item) => String(item) === String(id));
      return index === -1 ? current : current.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  return {
    cart,
    total,
    shippingOption,
    setShippingOption,
    updateCart,
    addToCart,
    removeFromCart,
    changeQuantity,
  };
}
