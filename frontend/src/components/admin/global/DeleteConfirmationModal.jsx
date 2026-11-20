"use client";

import { useRef } from "react";
import {
  DeleteModalFooter,
  DeleteModalIntro,
  DeleteModalTop,
  DeleteNotice,
  DeletePreviewCard,
  getItemDetails,
  getKindSingular,
} from "./delete-confirmation";
import { useModalDismiss } from "./modal";

/**
 * Global Delete Confirmation Modal Popup Screen for Admin Portal
 *
 * Shows a preview of the record and either a permanent-delete confirmation or,
 * when `isBlocked`, why it cannot be deleted (linked products). Locks body
 * scroll, closes on Escape/backdrop click (unless busy) and focuses the
 * confirm button on open.
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {() => void} props.onConfirm
 * @param {object|null} props.item Record to delete.
 * @param {string} props.kind Admin collection, e.g. "products".
 * @param {boolean} [props.isBlocked=false]
 * @param {number} [props.blockedCount=0]
 * @param {(name: string) => void} [props.onNavigateToAssigned]
 * @param {boolean} [props.busy=false]
 */
export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  item,
  kind,
  isBlocked = false,
  blockedCount = 0,
  onNavigateToAssigned,
  busy = false,
}) {
  const modalCardRef = useRef(null);
  const confirmBtnRef = useRef(null);

  // Keyboard navigation, body scroll lock and confirm button auto-focus
  useModalDismiss({ isOpen, busy, onClose, autoFocusRef: confirmBtnRef });

  if (!isOpen || !item) return null;

  const kindSingular = getKindSingular(kind);
  const { title, subtitle, image, badges } = getItemDetails(item, kind);

  return (
    <div
      className="admin-delete-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) {
          onClose?.();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div
        className={`admin-delete-modal-card ${isBlocked ? "is-blocked" : "is-danger"}`}
        ref={modalCardRef}
      >
        <DeleteModalTop isBlocked={isBlocked} busy={busy} onClose={onClose} />

        <div className="admin-delete-modal-body">
          <DeleteModalIntro
            kind={kind}
            kindSingular={kindSingular}
            isBlocked={isBlocked}
          />
          <DeletePreviewCard
            kind={kind}
            kindSingular={kindSingular}
            title={title}
            subtitle={subtitle}
            image={image}
            badges={badges}
          />
          <DeleteNotice
            isBlocked={isBlocked}
            blockedCount={blockedCount}
            kindSingular={kindSingular}
          />
        </div>

        <DeleteModalFooter
          isBlocked={isBlocked}
          busy={busy}
          blockedCount={blockedCount}
          kindSingular={kindSingular}
          item={item}
          onClose={onClose}
          onConfirm={onConfirm}
          onNavigateToAssigned={onNavigateToAssigned}
          confirmButtonRef={confirmBtnRef}
        />
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;
