"use client";

import { useEffect } from "react";

/**
 * While the notifications popover is open, close it on a mouse down outside
 * `containerRef` or on Escape.
 * @param {object} options
 * @param {import("react").RefObject<HTMLElement>} options.containerRef Wrapper of the bell and popover.
 * @param {boolean} options.open
 * @param {(open: boolean) => void} [options.onToggle] Called with `false` to close.
 */
export function useNotificationsDismiss({ containerRef, open, onToggle }) {
  useEffect(() => {
    if (!open) return undefined;
    const handleOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) onToggle?.(false);
    };
    const handleKey = (event) => {
      if (event.key === "Escape") onToggle?.(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onToggle, containerRef]);
}
