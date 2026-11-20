import { ConfirmModal } from "../../pages/modals/ConfirmModal";

/**
 * "Log Out of Admin Portal?" confirmation dialog.
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose Keeps the session.
 * @param {() => void} props.onConfirm Signs out.
 */
export function AdminLogoutConfirm({ isOpen, onClose, onConfirm }) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Log Out of Admin Portal?"
      message="Are you sure you want to end your administrative session?"
      confirmLabel="Log Out"
      variant="warning"
    />
  );
}
