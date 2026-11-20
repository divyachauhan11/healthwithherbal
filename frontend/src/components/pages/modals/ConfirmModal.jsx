"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Trash2, LogOut, X, Loader2 } from "lucide-react";

/**
 * Confirmation dialog: locks page scroll, focuses the confirm button and
 * closes on Escape or a backdrop click (both disabled while `loading`).
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} [props.onClose]
 * @param {() => void} props.onConfirm
 * @param {string} [props.title="Are you sure?"]
 * @param {import("react").ReactNode} [props.message="This action cannot be undone."]
 * @param {string} [props.confirmLabel="Confirm"]
 * @param {string} [props.cancelLabel="Cancel"]
 * @param {"danger"|"warning"|"default"} [props.variant="danger"] Colours and default icon.
 * @param {import("react").ComponentType<{size?: number}>} [props.icon] Custom icon component.
 * @param {boolean} [props.loading=false] Shows a spinner and disables every action.
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger", // "danger" | "warning" | "default"
  icon: CustomIcon,
  loading = false,
}) {
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      confirmBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose, loading]);

  if (!isOpen) return null;

  const IconComponent =
    CustomIcon ||
    (variant === "danger"
      ? Trash2
      : variant === "warning"
        ? LogOut
        : AlertTriangle);

  return (
    <div
      className="hwh-confirm-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose?.();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className={`hwh-confirm-modal-card is-${variant}`}>
        <button
          type="button"
          className="hwh-confirm-modal-close"
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className={`hwh-confirm-modal-icon-badge badge-${variant}`}>
          <IconComponent size={24} />
        </div>

        <div className="hwh-confirm-modal-content">
          <h3 id="confirm-modal-title" className="hwh-confirm-modal-title">
            {title}
          </h3>
          <p className="hwh-confirm-modal-desc">{message}</p>
        </div>

        <div className="hwh-confirm-modal-actions">
          <button
            type="button"
            className="hwh-confirm-btn secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            className={`hwh-confirm-btn action-${variant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Loader2 size={16} className="spin-animate" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;

