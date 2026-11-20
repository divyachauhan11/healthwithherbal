"use client";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";

/**
 * Status toast rendered into `document.body` while there is a message.
 * @param {{message: string}} props
 */
export function StorefrontToast({ message }) {
  if (!message || typeof document === "undefined") return null;
  return createPortal(
    <div className="toast" role="status" aria-live="polite">
      <Check size={16} />
      {message}
    </div>,
    document.body,
  );
}
