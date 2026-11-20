import { ConfirmModal } from "@/components/pages/modals/ConfirmModal";

/**
 * Confirmation dialog for deleting an announcement.
 * @param {{index: number|null, onCancel: () => void, onConfirm: () => void}} props
 *   Open while `index` (zero-based) is not null.
 */
export function AnnouncementDeleteModal({ index, onCancel, onConfirm }) {
  return (
    <ConfirmModal
      isOpen={index !== null}
      onClose={onCancel}
      onConfirm={onConfirm}
      title="Delete Announcement?"
      message={`Are you sure you want to delete announcement #${(index ?? 0) + 1}? This action cannot be undone.`}
      confirmLabel="Delete"
      variant="danger"
    />
  );
}
