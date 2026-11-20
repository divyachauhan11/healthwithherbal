"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Owns the admin toast message; each notification hides itself after 4.5 s.
 * A newer notification restarts the timer so it is not hidden early by the
 * previous one's timer.
 * @returns {{toast: {message: string, type: string}|null, notify: (message: string, type?: "success"|"error") => void}}
 */
export function useAdminToast() {
  const [toast, setToast] = useState(null);
  const hideTimerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(hideTimerRef.current), []);

  const notify = (message, type = "success") => {
    window.clearTimeout(hideTimerRef.current);
    setToast({ message, type });
    hideTimerRef.current = window.setTimeout(() => setToast(null), 4500);
  };

  return { toast, notify };
}
