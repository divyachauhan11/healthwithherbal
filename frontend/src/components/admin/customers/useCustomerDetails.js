"use client";

import { useCallback, useEffect } from "react";
import { fetchAdminCustomerDetail } from "@/lib/admin-api";
import { useAsyncResource } from "@/hooks";
import { getTotalSpent } from "./customer-utils";

/**
 * Loads a customer's profile, saved addresses and orders, and closes the details dialog
 * on Escape.
 * @param {{customer: object, token: string, onClose: () => void}} options
 *   `customer` is the list row, shown until the details load.
 * @returns {{account: object, orders: Array<object>, addresses: Array<object>, totalSpent: number, loading: boolean, error: string}}
 */
export function useCustomerDetails({ customer: listCustomer, token, onClose }) {
  const loadCustomer = useCallback(
    () => fetchAdminCustomerDetail(listCustomer.email, token),
    [listCustomer.email, token],
  );
  const { data: details, loading, error } = useAsyncResource({
    load: loadCustomer,
    deps: [listCustomer.email, token],
    enabled: true,
    initialData: null,
    clearErrorOnLoad: true,
    errorMessage: (requestError) => requestError.message || "Could not load customer details.",
  });

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const account = details?.customer || listCustomer;
  const orders = details?.orders || [];
  const addresses = details?.addresses || [];
  const totalSpent = getTotalSpent(orders);

  return { account, orders, addresses, totalSpent, loading, error };
}
