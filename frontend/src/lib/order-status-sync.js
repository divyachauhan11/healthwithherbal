/**
 * Cross-tab order status updates. When an admin changes an order's status,
 * customer tabs showing that order (account, order confirmation) update
 * immediately. Delivery uses BroadcastChannel, with a `storage` event
 * fallback for browsers or contexts where BroadcastChannel is unavailable.
 */
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { saveOrderStatusUpdate } from "@/lib/session";

const CHANNEL_NAME = "hwh_order_status";

/**
 * Announce an order status change to every open tab of this site.
 * @param {string} id Order `_id` (or order number).
 * @param {string} status New order status.
 */
export function publishOrderStatusUpdate(id, status) {
  if (typeof window === "undefined") return;
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ id, status, timestamp: Date.now() });
    channel.close();
  } catch {
    // BroadcastChannel unsupported; the storage event below still notifies tabs.
  }
  try {
    saveOrderStatusUpdate({ id, status, timestamp: Date.now() });
  } catch {
    // Storage unavailable; open tabs still receive the BroadcastChannel message.
  }
}

/**
 * Listen for order status changes published by {@link publishOrderStatusUpdate}.
 * @param {(update: {id?: string, status?: string}) => void} onUpdate Called with
 *   each received update; callers decide whether it applies to them.
 * @returns {() => void} Unsubscribe function.
 */
export function subscribeToOrderStatusUpdates(onUpdate) {
  if (typeof window === "undefined") return () => {};

  let channel = null;
  try {
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event) => onUpdate(event.data || {});
    }
  } catch {
    // Fall back to storage events only.
  }

  const handleStorage = (event) => {
    if (event.key !== STORAGE_KEYS.ORDER_STATUS_UPDATE || !event.newValue) return;
    let update;
    try {
      update = JSON.parse(event.newValue);
    } catch {
      return;
    }
    onUpdate(update || {});
  };
  window.addEventListener("storage", handleStorage);

  return () => {
    channel?.close();
    window.removeEventListener("storage", handleStorage);
  };
}
