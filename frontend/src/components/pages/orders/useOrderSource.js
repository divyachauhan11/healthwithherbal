"use client";
import { useEffect, useState } from "react";
import { fetchOrderDetails } from "@/lib/api";
import { clearStoredCart, getLastOrder, saveLastOrder } from "@/lib/session";
import { orderIdentifierFromPath } from "./order-utils";

/**
 * Resolves which order the confirmation / order details page shows. After the
 * `order` prop it owns three sources:
 * - confirmation mode: the PayU return (`?order=…&payment=…`), which also
 *   clears the stored cart once the payment is confirmed as paid;
 * - detail mode without an `order` prop: the order number in the URL;
 * - confirmation mode without an `order` prop: the last order saved in this browser.
 *
 * @param {object} options
 * @param {object|null} [options.order] Order handed over by the storefront.
 * @param {boolean} options.detailMode True on `/account/orders/:orderId`.
 * @returns {{rawOrder: object|null, loadingDetail: boolean, paymentResult: ""|"success"|"failed"|"pending"}}
 *   The resolved order (before live updates), whether the detail fetch is in
 *   flight, and the PayU payment result ("" when not returning from PayU).
 */
export function useOrderSource({ order, detailMode }) {
  const [cachedOrder, setCachedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [paymentResult, setPaymentResult] = useState("");

  useEffect(() => {
    if (detailMode || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const identifier = params.get("order");
    const result = params.get("payment");
    if (!identifier || !["success", "failed", "pending"].includes(result)) return;
    setPaymentResult("pending");
    let active = true;
    fetchOrderDetails(identifier)
      .then((fresh) => {
        if (!active || !fresh) return;
        setCachedOrder(fresh);
        setPaymentResult(
          fresh.paymentStatus === "paid"
            ? "success"
            : fresh.paymentStatus === "failed"
              ? "failed"
              : "pending",
        );
        if (fresh.paymentStatus === "paid") {
          window.setTimeout(() => window.dispatchEvent(new Event("hwh-payment-order-complete")), 0);
          try {
            clearStoredCart();
          } catch {}
        }
        try {
          saveLastOrder(fresh);
        } catch {}
      })
      .catch((error) => {
        if (active) console.error("Could not load the PayU order result:", error);
      });
    return () => {
      active = false;
    };
  }, [detailMode]);

  useEffect(() => {
    if (!detailMode || order || typeof window === "undefined") return;
    const identifier = orderIdentifierFromPath(-1);
    if (!identifier) return;
    let active = true;
    setLoadingDetail(true);
    fetchOrderDetails(identifier)
      .then((fresh) => {
        if (active) setCachedOrder(fresh);
      })
      .catch((error) => {
        if (active) console.error("Could not load order details:", error);
      })
      .finally(() => {
        if (active) setLoadingDetail(false);
      });
    return () => {
      active = false;
    };
  }, [detailMode, order]);

  useEffect(() => {
    if (!detailMode && !order && typeof window !== "undefined") {
      try {
        const saved = getLastOrder();
        if (saved) {
          setCachedOrder(saved);
        }
      } catch {}
    }
  }, [order, detailMode]);

  return { rawOrder: order || cachedOrder || null, loadingDetail, paymentResult };
}
