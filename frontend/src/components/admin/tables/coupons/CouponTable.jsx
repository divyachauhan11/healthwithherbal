import { useMemo } from "react";
import { DataTable } from "../DataTable";
import { getCouponColumns } from "./coupon-columns";

/**
 * Coupons table with edit and delete row actions.
 * @param {Object} props
 * @param {Array<Object>} [props.rows=[]] Coupons.
 * @param {(coupon: Object) => void} [props.onEdit]
 * @param {(coupon: Object) => void} props.onDelete
 * @param {number} [props.pageSize=10] Initial rows per page.
 */
export function CouponTable({
  rows = [],
  onEdit,
  onDelete,
  pageSize: initialPageSize = 10,
}) {
  const columns = useMemo(
    () => getCouponColumns({ onEdit, onDelete }),
    [onEdit, onDelete],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      pageSize={initialPageSize}
      emptyMessage="No coupons created yet."
    />
  );
}
