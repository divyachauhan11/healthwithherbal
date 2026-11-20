import { ArrowRight, Loader2, Trash2 } from "lucide-react";

/**
 * Delete dialog actions: Close / "View Assigned Products" when blocked,
 * otherwise Cancel / "Yes, delete permanently".
 * @param {object} props
 * @param {boolean} props.isBlocked
 * @param {boolean} props.busy Shows the deleting state and disables the buttons.
 * @param {number} props.blockedCount Number of linked products.
 * @param {string} props.kindSingular Human-readable singular kind.
 * @param {object} props.item Record being deleted.
 * @param {() => void} props.onClose
 * @param {() => void} props.onConfirm
 * @param {(name: string) => void} [props.onNavigateToAssigned] Opens the products assigned to the record.
 * @param {import("react").RefObject<HTMLButtonElement>} props.confirmButtonRef Ref for the confirm button (auto-focused).
 */
export function DeleteModalFooter({
  isBlocked,
  busy,
  blockedCount,
  kindSingular,
  item,
  onClose,
  onConfirm,
  onNavigateToAssigned,
  confirmButtonRef,
}) {
  return (
    <div className="admin-delete-modal-footer">
      {isBlocked ? (
        <>
          <button
            type="button"
            className="admin-delete-btn secondary"
            onClick={onClose}
            disabled={busy}
          >
            Close
          </button>
          {onNavigateToAssigned && (
            <button
              type="button"
              className="admin-delete-btn primary-action"
              onClick={() => {
                onClose();
                onNavigateToAssigned(item.name || item.title);
              }}
            >
              View Assigned Products ({blockedCount}) <ArrowRight size={15} />
            </button>
          )}
        </>
      ) : (
        <>
          <button
            type="button"
            className="admin-delete-btn secondary"
            onClick={onClose}
            disabled={busy}
          >
            Cancel, keep {kindSingular.toLowerCase()}
          </button>
          <button
            type="button"
            ref={confirmButtonRef}
            className="admin-delete-btn danger-action"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? (
              <>
                <Loader2 size={16} className="spin-animate" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 size={15} />
                Yes, delete permanently
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
