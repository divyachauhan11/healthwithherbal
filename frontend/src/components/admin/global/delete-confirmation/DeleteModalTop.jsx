import { ShieldAlert, Trash2, X } from "lucide-react";

/**
 * Top row of the delete dialog: danger/blocked icon badge and close button.
 * @param {object} props
 * @param {boolean} props.isBlocked Whether deletion is blocked by linked products.
 * @param {boolean} props.busy Disables the close button.
 * @param {() => void} props.onClose
 */
export function DeleteModalTop({ isBlocked, busy, onClose }) {
  return (
    <div className="admin-delete-modal-top">
      <div
        className={`admin-delete-modal-icon-badge ${
          isBlocked ? "badge-blocked" : "badge-danger"
        }`}
      >
        {isBlocked ? (
          <ShieldAlert size={28} />
        ) : (
          <Trash2 size={26} />
        )}
      </div>

      <button
        type="button"
        className="admin-delete-modal-close"
        onClick={onClose}
        disabled={busy}
        aria-label="Close dialog"
      >
        <X size={18} />
      </button>
    </div>
  );
}
