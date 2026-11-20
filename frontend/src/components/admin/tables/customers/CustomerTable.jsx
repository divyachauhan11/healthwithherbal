import { useMemo } from "react";
import { DataTable } from "../DataTable";
import { getCustomerColumns } from "./customer-columns";

/**
 * Customers table (accounts and guest buyers) with view and suspend actions.
 * @param {Object} props
 * @param {Array<Object>} [props.rows=[]] Customers.
 * @param {number} [props.pageSize=10] Initial rows per page.
 * @param {(customer: Object) => void} [props.onView]
 * @param {(customer: Object) => void} [props.onSuspend]
 */
export function CustomerTable({ rows = [], pageSize: initialPageSize = 10, onView, onSuspend }) {
  const columns = useMemo(
    () => getCustomerColumns({ onView, onSuspend }),
    [onView, onSuspend],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      pageSize={initialPageSize}
      emptyMessage="No customer accounts or order customers found."
    />
  );
}
