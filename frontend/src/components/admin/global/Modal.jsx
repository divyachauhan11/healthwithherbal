"use client";

import { useRef } from "react";
import { ModalFooter, ModalHeader, useModalDismiss } from "./modal";

/**
 * Global Base Modal Component
 * Handles backdrop, card frame, header, scrolling body, footer, escape key, and scroll lock.
 * With `onSubmit` the card content is a `<form>` and the footer shows a submit button.
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
  className = "",
}) {
  const modalRef = useRef(null);

  useModalDismiss({ isOpen, busy, onClose });

  if (!isOpen) return null;

  const content = (
    <>
      <ModalHeader title={title} subtitle={subtitle} busy={busy} onClose={onClose} />

      <div className="admin-modal-body">
        <div className="form-section" style={{ padding: 0 }}>
          {children}
        </div>
      </div>

      {showFooter && (
        <ModalFooter
          footer={footer}
          busy={busy}
          onClose={onClose}
          cancelLabel={cancelLabel}
          showSubmit={Boolean(onSubmit)}
          submitLabel={submitLabel}
        />
      )}
    </>
  );

  return (
    <div
      className={`admin-modal-backdrop ${className}`.trim()}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) {
          onClose?.();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className={`admin-modal-card ${className}`.trim()} ref={modalRef} style={{ maxWidth }}>
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
