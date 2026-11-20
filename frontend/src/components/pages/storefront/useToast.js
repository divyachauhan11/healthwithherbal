"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Owns the storefront toast message. `notify` shows a message and clears it
 * 2.2 s later; a newer message restarts the timer so an older toast's timer
 * cannot hide it early.
 * @returns {{toast: string, notify: (message: string) => void}}
 */
export function useToast() {
  const [toast, setToast] = useState("");
  const hideTimerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(hideTimerRef.current), []);

  const notify = (message) => {
    window.clearTimeout(hideTimerRef.current);
    setToast(message);
    hideTimerRef.current = window.setTimeout(() => setToast(""), 2200);
  };

  return { toast, notify };
}
