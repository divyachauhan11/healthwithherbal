"use client";
import { useEffect, useState } from "react";
import { fetchOrderDetails, getOrderLiveStreamUrl } from "@/lib/api";
import { subscribeToOrderStatusUpdates } from "@/lib/order-status-sync";
import { ORDER_STATUSES } from "@/constants/statuses";

/**
 * Keeps an order's status live while it is on screen: one immediate refresh,
 * the server-sent event stream, status changes the admin portal broadcasts
 * from another tab, and a polling fallback every 3.5 s. All of it is torn
 * down when the order number / id changes or the page unmounts.
 *
 * @param {object|null} rawOrder Order resolved by `useOrderSource`.
 * @returns {{displayOrder: object|null, currentStatus: string}} The order
 *   merged with the latest live data, and its lower-cased status
 *   (`"placed"` when unknown).
 */
export function useLiveOrder(rawOrder) {
  const [liveOrderData, setLiveOrderData] = useState(null);

  const displayOrder =
    liveOrderData && rawOrder ? { ...rawOrder, ...liveOrderData } : rawOrder;

  const currentStatus = (displayOrder?.status || ORDER_STATUSES[0]).toLowerCase();

  // Real-time synchronization with admin status changes
  useEffect(() => {
    const targetOrderNumber = rawOrder?.orderNumber;
    const targetOrderId = rawOrder?._id;
    const identifier = targetOrderNumber || targetOrderId;
    if (!identifier) return;

    let isMounted = true;

    // 1. Initial live fetch from backend
    fetchOrderDetails(identifier)
      .then((fresh) => {
        if (isMounted && fresh) {
          setLiveOrderData((prev) => ({ ...(prev || {}), ...fresh }));
        }
      })
      .catch((error) => {
        // The SSE stream and polling below keep retrying; the page shows the cached order meanwhile.
        if (isMounted) console.warn("Could not refresh the order status:", error.message);
      });

    // 2. Connect to real-time Server-Sent Events (SSE) stream
    let eventSource = null;
    try {
      const sseUrl = getOrderLiveStreamUrl(identifier);
      if (sseUrl && typeof EventSource !== "undefined") {
        eventSource = new EventSource(sseUrl);
        eventSource.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (isMounted && data?.status) {
              setLiveOrderData((prev) => ({
                ...(prev || {}),
                status: data.status,
                updatedAt: data.updatedAt || new Date().toISOString(),
              }));
            }
          } catch {}
        };
      }
    } catch {}

    // 3. Apply status changes the admin portal broadcasts from another tab
    const unsubscribeStatusUpdates = subscribeToOrderStatusUpdates(({ id, status }) => {
      if (
        isMounted &&
        status &&
        (id === targetOrderId ||
          id === targetOrderNumber ||
          id === displayOrder?.orderNumber ||
          id === displayOrder?._id)
      ) {
        setLiveOrderData((prev) => ({
          ...(prev || {}),
          status,
          updatedAt: new Date().toISOString(),
        }));
      }
    });

    // 4. Polling fallback every 3.5 seconds
    const intervalId = setInterval(async () => {
      try {
        const fresh = await fetchOrderDetails(identifier);
        if (isMounted && fresh?.status) {
          setLiveOrderData((prev) => ({ ...(prev || {}), ...fresh }));
        }
      } catch {}
    }, 3500);

    return () => {
      isMounted = false;
      eventSource?.close();
      unsubscribeStatusUpdates();
      clearInterval(intervalId);
    };
    // Restart only when the order identity changes; the cross-tab matcher keeps
    // the `displayOrder` of the render that started this subscription.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawOrder?.orderNumber, rawOrder?._id]);

  return { displayOrder, currentStatus };
}
