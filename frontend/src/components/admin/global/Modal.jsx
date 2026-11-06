"use client";

import { useEffect, useRef } from "react";
import { X, Loader2 } from "lucide-react";

/**
 * Global Base Modal Component
 * Handles backdrop, card frame, header, scrolling body, footer, escape key, and scroll lock.
 */
export function Modal({
  isOpen,
  title,
  subtitle,
  maxWidth = "820px",
  onClose,
  onSubmit,
  busy = false,
  submitLabel = "Save changes",
  cancelLabel = "Cancel",
  showFooter = true,
  footer,
  children,
}) {
  const modalRef = useRef(null);

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !busy) {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, busy]);

  if (!isOpen) return null;

  const content = (
    <>
      {/* Modal Header */}
      <div className="admin-modal-header">
        <div>
          {title && <h2>{title}</h2>}
          {subtitle && <p>{subtitle}</p>}
        </div>
        <button
          type="button"
          className="admin-modal-close"
          onClick={onClose}
          disabled={busy}
          aria-label="Close modal"
        >
          <X size={16} />
        </button>
      </div>

      {/* Modal Body */}
      <div className="admin-modal-body">
        <div className="form-section" style={{ padding: 0 }}>
          {children}
        </div>
      </div>

      {/* Modal Footer */}
      {showFooter && (
        <div className="admin-modal-footer">
          {footer ? (
            footer
          ) : (
            <>
              <button
                type="button"
                className="outline"
                onClick={onClose}
                disabled={busy}
              >
                {cancelLabel}
              </button>
              {onSubmit && (
                <button type="submit" className="primary" disabled={busy}>
                  {busy ? (
                    <>
                      <Loader2 size={15} className="spin-animate" />
                      Saving…
                    </>
                  ) : (
                    submitLabel
                  )}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </>
  );

  return (
    <div
      className="admin-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) {
          onClose?.();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="admin-modal-card" ref={modalRef} style={{ maxWidth }}>
        {onSubmit ? (
          <form onSubmit={onSubmit} className="admin-modal-form">
            {content}
          </form>
        ) : (
          <div className="admin-modal-form">{content}</div>
        )}
      </div>
    </div>
  );
}

export default Modal;
