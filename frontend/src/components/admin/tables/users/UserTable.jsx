import { useMemo } from "react";
import { DataTable } from "../DataTable";
import { getUserColumns } from "./user-columns";

/**
 * Admin and employee accounts table with edit and delete actions.
 * @param {Object} props
 * @param {Array<Object>} [props.rows=[]] Staff accounts.
 * @param {number} [props.pageSize=10] Initial rows per page.
 * @param {(person: Object) => void} [props.onEdit]
 * @param {(person: Object) => void} [props.onDelete]
 * @param {string} [props.currentUserId] Signed-in admin id (cannot be deleted).
 * @param {string} [props.currentUserEmail] Signed-in admin email (cannot be deleted).
 */
export function UserTable({ rows = [], pageSize: initialPageSize = 10, onEdit, onDelete, currentUserId, currentUserEmail }) {
  const columns = useMemo(
    () => getUserColumns({ onEdit, onDelete, currentUserId, currentUserEmail }),
    [onEdit, onDelete, currentUserId, currentUserEmail],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      pageSize={initialPageSize}
      emptyMessage="No admin or employee accounts found."
    />
  );
}
