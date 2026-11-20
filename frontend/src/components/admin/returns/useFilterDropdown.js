"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Open state for a filter dropdown that closes on an outside pointer press or Escape.
 * @returns {{open: boolean, setOpen: Function, rootRef: {current: HTMLElement|null}}}
 */
export function useFilterDropdown() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return { open, setOpen, rootRef };
}
