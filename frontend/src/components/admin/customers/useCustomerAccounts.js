"use client";

import { useState } from "react";
import { setAdminCustomerActive } from "@/lib/admin-api";

/**
 * Owns the customers page actions: the customer shown in the details dialog and
 * suspending/reactivating accounts (suspending asks for confirmation first).
 * @param {{token: string, onRefresh?: () => void}} options
 * @returns {{selectedCustomer: object|null, setSelectedCustomer: Function, updateCustomerStatus: (customer: object) => Promise<void>}}
 */
export function useCustomerAccounts({ token, onRefresh }) {
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const updateCustomerStatus = async (customer) => {
    const isActive = customer.isActive === false;
    if (!isActive && !window.confirm(`Suspend ${customer.name || customer.email}? They will no longer be able to sign in.`)) return;

    try {
      await setAdminCustomerActive(customer.email, isActive, token);
      onRefresh?.();
    } catch (error) {
      window.alert(error.message || "Could not update the customer account.");
    }
  };

  return { selectedCustomer, setSelectedCustomer, updateCustomerStatus };
}
