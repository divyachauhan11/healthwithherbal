import { useMemo, useState } from "react";
import { updateAdminOrderStatus } from "@/lib/admin-api";
import { publishOrderStatusUpdate } from "@/lib/order-status-sync";
import { getOrderColumns } from "./order-columns";

/**
 * Owns the orders table state: the order shown in the details view and the
 * status update (which also notifies open storefront tabs).
 * @param {{compact: boolean, onStatus?: () => void}} options `onStatus` runs after a successful status change.
 * @returns {{columns: Array<Object>, selectedOrder: Object|null, closeOrderDetails: () => void}}
 */
export function useOrderTable({ compact, onStatus }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const updateStatus = async (id, status) => {
    try {
      await updateAdminOrderStatus(id, status);
      // Update open storefront tabs and customer windows immediately.
      publishOrderStatusUpdate(id, status);
      onStatus?.();
    } catch (error) {
      window.alert(error.message);
    }
  };

  // Columns are only rebuilt when `compact` changes; they keep the status
  // handler (and its `onStatus`) from that render, as the table always has.
  const columns = useMemo(
    () => getOrderColumns({ compact, onView: setSelectedOrder, onStatusChange: updateStatus }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [compact],
  );

  return {
    columns,
    selectedOrder,
    closeOrderDetails: () => setSelectedOrder(null),
  };
}
