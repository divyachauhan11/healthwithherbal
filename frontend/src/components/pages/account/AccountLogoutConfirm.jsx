import { ConfirmModal } from "@/components/pages/modals";

/**
 * "Log Out?" confirmation dialog of the account page.
 * @param {object} props
 * @param {boolean} props.isOpen Dialog is open.
 * @param {() => void} props.onClose Dismisses the dialog.
 * @param {() => void} props.onConfirm Logs the customer out.
 */
export function AccountLogoutConfirm({ isOpen, onClose, onConfirm }) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Log Out?"
      message="Are you sure you want to log out of your account?"
      confirmLabel="Log Out"
      variant="warning"
    />
  );
}
