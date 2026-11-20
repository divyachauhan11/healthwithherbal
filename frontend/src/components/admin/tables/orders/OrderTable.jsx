import { DataTable } from "../DataTable";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { useOrderTable } from "./useOrderTable";

/**
 * Orders table with inline status changes, row actions (details, invoice
 * download/print) and the order details dialog.
 * @param {Object} props
 * @param {Array<Object>} [props.rows=[]] Orders.
 * @param {boolean} [props.compact=false] Dashboard variant without items, address and actions.
 * @param {() => void} [props.onStatus] Called after an order status changes.
 * @param {number} [props.pageSize=10] Initial rows per page.
 */
export function OrderTable({
  rows = [],
  compact = false,
  onStatus,
  pageSize: initialPageSize = 10,
}) {
  const { columns, selectedOrder, closeOrderDetails } = useOrderTable({ compact, onStatus });

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        pageSize={initialPageSize}
        pageSizeOptions={compact ? [7, 10, 20] : [10, 25, 50]}
        emptyMessage="No orders found yet."
      />
      <OrderDetailsModal order={selectedOrder} onClose={closeOrderDetails} />
    </>
  );
}
