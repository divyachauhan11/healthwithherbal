import { useMemo } from "react";
import { DataTable } from "../DataTable";
import { getProductColumns } from "./product-columns";

/**
 * Products table with edit, hide/unhide and delete row actions.
 * @param {Object} props
 * @param {Array<Object>} [props.rows=[]] Products.
 * @param {(product: Object) => void} props.onEdit
 * @param {(product: Object) => void} props.onDelete
 * @param {(product: Object) => void} [props.onToggleStatus] Enables the hide/unhide action.
 * @param {number} [props.pageSize=10] Initial rows per page.
 */
export function ProductTable({
  rows = [],
  onEdit,
  onDelete,
  onToggleStatus,
  pageSize: initialPageSize = 10,
}) {
  const columns = useMemo(
    () => getProductColumns({ onEdit, onDelete, onToggleStatus }),
    [onEdit, onDelete, onToggleStatus],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      pageSize={initialPageSize}
      tableClassName="product-table"
      emptyMessage="No products match this search."
    />
  );
}
