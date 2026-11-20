import { useCallback, useMemo, useState } from "react";
import { deleteAdminReview, updateAdminReview } from "@/lib/admin-api";
import { REVIEW_STATUSES } from "@/constants/statuses";
import { getReviewColumns } from "./review-columns";
import { getModerationMessage } from "./review-utils";

/**
 * Owns review moderation for the reviews table: approve/reject requests and,
 * when the page does not handle deletes itself, the delete confirmation.
 * @param {Object} options
 * @param {string} [options.token] Admin session token.
 * @param {() => void} [options.onChange] Called after a review changes.
 * @param {(message: string, type: string) => void} options.notify Toast callback.
 * @param {(review: Object) => void} [options.onDelete] Page-level delete handler.
 * @returns {{columns: Array<Object>, pendingDelete: Object|null, busy: boolean, cancelDelete: () => void, confirmDelete: () => Promise<void>}}
 */
export function useReviewTable({ token, onChange, notify, onDelete }) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const moderateReview = useCallback(async (review, isApproved, status) => {
    try {
      await updateAdminReview(
        review._id,
        {
          isApproved,
          status: status || (isApproved ? REVIEW_STATUSES[1] : REVIEW_STATUSES[2]),
        },
        token,
      );
      onChange?.();
      notify(getModerationMessage(isApproved), "success");
    } catch (error) {
      notify(error.message, "error");
    }
  }, [token, onChange, notify]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setBusy(true);
    try {
      await deleteAdminReview(pendingDelete._id, token);
      onChange?.();
      notify("Review deleted.", "success");
      setPendingDelete(null);
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const columns = useMemo(
    () => getReviewColumns({
      onModerate: moderateReview,
      onDelete: (review) => (onDelete ? onDelete(review) : setPendingDelete(review)),
    }),
    [moderateReview, onDelete],
  );

  return {
    columns,
    pendingDelete,
    busy,
    cancelDelete: () => setPendingDelete(null),
    confirmDelete,
  };
}
