import { DataTable } from "../DataTable";
import { DeleteConfirmationModal } from "../../global/DeleteConfirmationModal";
import { useReviewTable } from "./useReviewTable";

/**
 * Product reviews table with approve/reject/delete actions. Deletes go to
 * `onDelete` when given, otherwise they are confirmed in a built-in modal.
 * @param {Object} props
 * @param {Array<Object>} [props.rows=[]] Reviews.
 * @param {string} [props.token] Admin session token.
 * @param {() => void} [props.onChange] Called after a review changes.
 * @param {(message: string, type: string) => void} props.notify Toast callback.
 * @param {(review: Object) => void} [props.onDelete] Page-level delete handler.
 * @param {number} [props.pageSize=10] Initial rows per page.
 */
export function ReviewTable({
  rows = [],
  token,
  onChange,
  notify,
  onDelete,
  pageSize: initialPageSize = 10,
}) {
  const { columns, pendingDelete, busy, cancelDelete, confirmDelete } =
    useReviewTable({ token, onChange, notify, onDelete });

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        pageSize={initialPageSize}
        emptyMessage="No product reviews available."
      />
      {!onDelete && (
        <DeleteConfirmationModal
          isOpen={Boolean(pendingDelete)}
          item={pendingDelete}
          kind="reviews"
          busy={busy}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
