"use client";

import { useEffect, useState } from "react";
import { fetchAdminNotifications } from "../../../lib/admin-api";

/**
 * Owns the header notifications: loads them when signed in, polls every 60 s,
 * clears them on sign-out, and tracks the popover's open/loading state.
 * @param {string} token Admin token ("" when signed out).
 * @returns {{
 *   notifications: Array<object>, notificationsOpen: boolean, setNotificationsOpen: Function,
 *   notificationsLoading: boolean, refreshNotifications: () => void,
 * }}
 */
export function useAdminNotifications(token) {
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setNotifications([]);
      return undefined;
    }
    let active = true;
    const refresh = async () => {
      if (active) setNotificationsLoading(true);
      try {
        const items = await fetchAdminNotifications(token);
        if (active) setNotifications(items);
      } catch (error) {
        if (active) console.warn("Could not load admin notifications:", error.message);
      } finally {
        if (active) setNotificationsLoading(false);
      }
    };
    refresh();
    const intervalId = window.setInterval(refresh, 60000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [token]);

  /** Reload the notifications now (popover open / Refresh button). */
  const refreshNotifications = () => {
    if (!token) return;
    setNotificationsLoading(true);
    fetchAdminNotifications(token)
      .then(setNotifications)
      .catch((error) => console.warn("Could not refresh admin notifications:", error.message))
      .finally(() => setNotificationsLoading(false));
  };

  return {
    notifications,
    notificationsOpen,
    setNotificationsOpen,
    notificationsLoading,
    refreshNotifications,
  };
}
