"use client";
import { useEffect, useState } from "react";
import { fetchOrderDetails } from "@/lib/api";
import { orderIdentifierFromPath } from "./order-utils";

/**
 * Loads the order shown on the invoice page: the `order` prop when the
 * storefront already has it, otherwise the order number in the URL
 * (`/account/orders/:orderId/invoice`).
 * @param {object|null} [order] Order handed over by the storefront.
 * @returns {{loadedOrder: object|null, loading: boolean, error: string}}
 */
export function useInvoiceOrder(order) {
  const [loadedOrder, setLoadedOrder] = useState(null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState("");

  useEffect(() => {
    if (order) {
      setLoadedOrder(order);
      setLoading(false);
      return;
    }
    const identifier = orderIdentifierFromPath(-2);
    if (!identifier) {
      setLoading(false);
      setError("Order number is missing.");
      return;
    }
    let active = true;
    fetchOrderDetails(identifier)
      .then((data) => { if (active) setLoadedOrder(data); })
      .catch((fetchError) => { if (active) setError(fetchError.message || "Could not load this order."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [order]);

  return { loadedOrder, loading, error };
}
