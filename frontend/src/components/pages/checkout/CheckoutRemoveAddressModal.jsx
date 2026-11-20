import { ConfirmModal } from "@/components/pages/modals";

/**
 * Confirmation dialog for removing a saved address.
 * @param {object} props
 * @param {object|null} props.address Address to remove; the dialog is open while set.
 * @param {boolean} props.loading Removal is in progress.
 * @param {() => void} props.onCancel Closes the dialog.
 * @param {() => void} props.onConfirm Removes the address.
 */
export function CheckoutRemoveAddressModal({ address, loading, onCancel, onConfirm }) {
  return (
    <ConfirmModal
      isOpen={Boolean(address)}
      onClose={onCancel}
      onConfirm={onConfirm}
      loading={loading}
      title="Delete Address?"
      message={`Are you sure you want to remove the saved address for ${address?.fullName || "this recipient"}? This action cannot be undone.`}
      confirmLabel="Delete"
      variant="danger"
    />
  );
}
