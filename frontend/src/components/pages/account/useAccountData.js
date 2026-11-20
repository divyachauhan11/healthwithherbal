"use client";
import { useEffect, useState } from "react";
import { fetchUserAddresses, fetchUserOrders } from "@/lib/api";
import { subscribeToOrderStatusUpdates } from "@/lib/order-status-sync";

/**
 * Loads the signed-in customer's orders and saved addresses (again whenever
 * the customer's phone, email or id changes) and applies order status changes
 * that the admin portal broadcasts from other tabs.
 * @param {object|null} currentUser Signed-in customer; nothing loads without one.
 * @returns {{
 *   orders: object[], setOrders: Function, loadingOrders: boolean,
 *   addresses: object[], setAddresses: Function, loadingAddresses: boolean,
 * }}
 */
export function useAccountData(currentUser) {
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Load orders and addresses whenever currentUser changes
  useEffect(() => {
    if (!currentUser) return;

    let active = true;
    setLoadingOrders(true);
    setLoadingAddresses(true);

    const query = {
      phone: currentUser.phone || "",
      email: currentUser.email || "",
      userId: currentUser._id || "",
    };

    fetchUserOrders(query)
      .then((data) => {
        if (active) setOrders(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to load user orders:", err);
      })
      .finally(() => {
        if (active) setLoadingOrders(false);
      });

    fetchUserAddresses(query)
      .then((data) => {
        if (active) setAddresses(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to load user addresses:", err);
      })
      .finally(() => {
        if (active) setLoadingAddresses(false);
      });

    return () => {
      active = false;
    };
    // Reload only when the customer's identity fields change, not for every new user object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.phone, currentUser?.email, currentUser?._id]);

  // Real-time synchronization for order status updates from admin
  useEffect(
    () =>
      subscribeToOrderStatusUpdates(({ id, status }) => {
        if (id && status) {
          setOrders((prev) =>
            prev.map((o) =>
              o._id === id || o.orderNumber === id ? { ...o, status } : o,
            ),
          );
        }
      }),
    [],
  );

  return { orders, setOrders, loadingOrders, addresses, setAddresses, loadingAddresses };
}
