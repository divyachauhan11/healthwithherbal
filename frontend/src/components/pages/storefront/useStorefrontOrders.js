"use client";
import { useEffect, useState } from "react";
import { saveLastOrder } from "@/lib/session";

/**
 * Owns the orders shown on the order pages: the order just placed at checkout
 * and the account order opened for details or its invoice.
 * @param {object} options
 * @param {(updater: Array|Function) => void} options.updateCart From `useCart`.
 * @param {(next: string, options?: object) => void} options.navigate From `useStorefrontNavigation`.
 * @param {(message: string) => void} options.notify
 * @returns {{
 *   placedOrder: object|null,
 *   selectedOrder: object|null,
 *   completeOrder: (order: object) => void,
 *   viewOrder: (order: object) => void,
 * }}
 */
export function useStorefrontOrders({ updateCart, navigate, notify }) {
  const [placedOrder, setPlacedOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Back/forward to another order's URL must not keep showing the order that
  // was opened last: drop the selection so the order page loads the order
  // named in the URL.
  useEffect(() => {
    const forgetMismatchedOrder = () => {
      const [section, sub, identifier] = window.location.pathname.split("/").filter(Boolean);
      if (section !== "account" || sub !== "orders" || !identifier) return;
      const urlOrderId = decodeURIComponent(identifier);
      setSelectedOrder((current) =>
        current && urlOrderId !== String(current.orderNumber) && urlOrderId !== String(current._id)
          ? null
          : current,
      );
    };
    window.addEventListener("popstate", forgetMismatchedOrder);
    return () => window.removeEventListener("popstate", forgetMismatchedOrder);
  }, []);

  const completeOrder = (order) => {
    updateCart([]);
    setPlacedOrder(order);
    try {
      saveLastOrder(order);
    } catch {}
    navigate("order-placed");
    notify(`Order ${order.orderNumber} placed successfully!`);
  };

  const viewOrder = (order) => {
    setSelectedOrder(order);
    navigate("order-details", { orderId: order.orderNumber || order._id });
  };

  return { placedOrder, selectedOrder, completeOrder, viewOrder };
}
