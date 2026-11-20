import { currency, dateLabel } from "../../global/admin-utils";
import { OrderAddressCell } from "./OrderAddressCell";
import { OrderCustomerCell } from "./OrderCustomerCell";
import { OrderItemsCell } from "./OrderItemsCell";
import { OrderNumberButton } from "./OrderNumberButton";
import { OrderRowActions } from "./OrderRowActions";
import { OrderStatusSelect } from "./OrderStatusSelect";
import { compareOrderCustomers, compareOrderTotals } from "./order-utils";

/**
 * DataTable column definitions for the orders table.
 * @param {Object} options
 * @param {boolean} options.compact Hide the items, address and actions columns (dashboard widget).
 * @param {(order: Object) => void} options.onView Open the order details view.
 * @param {(orderId: string, status: string) => void} options.onStatusChange Change an order's status.
 * @returns {Array<Object>}
 */
export function getOrderColumns({ compact, onView, onStatusChange }) {
  return [
    {
      key: "orderNumber",
      label: "Order",
      className: "th-order",
      cellClassName: "cell-order",
      sortable: true,
      render: (order) => <OrderNumberButton order={order} onView={onView} />,
    },
    {
      key: "customer",
      label: "Customer",
      className: "th-customer",
      cellClassName: "cell-customer",
      sortable: true,
      sortFn: compareOrderCustomers,
      render: (order) => <OrderCustomerCell order={order} />,
    },
    {
      key: "items",
      label: "Items",
      className: "th-items",
      cellClassName: "cell-items",
      hide: compact,
      render: (order) => <OrderItemsCell items={order.items} />,
    },
    {
      key: "address",
      label: "Address",
      className: "th-address",
      cellClassName: "cell-address",
      hide: compact,
      render: (order) => <OrderAddressCell order={order} />,
    },
    {
      key: "total",
      label: "Total",
      className: "th-total",
      cellClassName: "cell-total",
      sortable: true,
      sortFn: compareOrderTotals,
      render: (order) => (
        <b>{currency(order.total, order.currency || "INR")}</b>
      ),
    },
    {
      key: "status",
      label: "Status",
      className: "th-status",
      cellClassName: "cell-status",
      sortable: true,
      render: (order) => <OrderStatusSelect order={order} onStatusChange={onStatusChange} />,
    },
    {
      key: "createdAt",
      label: "Date",
      className: "th-date",
      cellClassName: "cell-date muted",
      sortable: true,
      render: (order) => dateLabel(order.createdAt),
    },
    {
      key: "details",
      label: "Actions",
      className: "th-order-details",
      cellClassName: "cell-order-details",
      hide: compact,
      render: (order) => <OrderRowActions order={order} onView={onView} />,
    },
  ];
}
