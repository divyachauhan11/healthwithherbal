import { ConfirmModal } from "@/components/pages/modals";

/**
 * "Delete Address?" confirmation dialog; open while `address` is set.
 * @param {object} props
 * @param {object|null} props.address Address pending deletion.
 * @param {boolean} props.loading Deletion in progress.
 * @param {() => void} props.onClose Dismisses the dialog.
 * @param {() => void} props.onConfirm Deletes the address.
 */
export function DeleteAddressConfirm({ address, loading, onClose, onConfirm }) {
  return (
    <ConfirmModal
      isOpen={Boolean(address)}
      onClose={onClose}
      onConfirm={onConfirm}
      loading={loading}
      title="Delete Address?"
      message={`Are you sure you want to remove the saved address for ${address?.fullName || "this recipient"}? This action cannot be undone.`}
      confirmLabel="Delete"
      variant="danger"
    />
  );
}
