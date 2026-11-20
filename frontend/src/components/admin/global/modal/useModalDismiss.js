"use client";

import { useEffect } from "react";

/**
 * While a modal is open: lock body scrolling, close on Escape (unless busy)
 * and, when `autoFocusRef` is given, focus that element after 50 ms.
 * Restores the previous body overflow on close/unmount.
 * @param {object} options
 * @param {boolean} options.isOpen
 * @param {boolean} [options.busy] Ignore Escape while an action is running.
 * @param {() => void} [options.onClose]
 * @param {import("react").RefObject<HTMLElement>} [options.autoFocusRef] Element to focus on open.
 */
export function useModalDismiss({ isOpen, busy, onClose, autoFocusRef }) {
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = autoFocusRef
      ? setTimeout(() => {
          autoFocusRef.current?.focus();
        }, 50)
      : undefined;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !busy) {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [isOpen, onClose, busy, autoFocusRef]);
}
