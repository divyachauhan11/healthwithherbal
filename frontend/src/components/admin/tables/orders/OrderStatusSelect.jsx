import { ORDER_STATUSES } from "@/constants/statuses";
import { classStatus } from "../../global/admin-utils";

/**
 * Status dropdown that changes an order's fulfilment status.
 * @param {{order: Object, onStatusChange: (orderId: string, status: string) => void}} props
 */
export function OrderStatusSelect({ order, onStatusChange }) {
  return (
    <select
      className={`status-select ${classStatus(order.status)}`}
      value={order.status}
      onChange={(event) => onStatusChange(order._id, event.target.value)}
      aria-label={`Update order ${order.orderNumber} status`}
    >
      {ORDER_STATUSES.map(
        (status) => (
          <option value={status} key={status}>
            {status}
          </option>
        ),
      )}
    </select>
  );
}
