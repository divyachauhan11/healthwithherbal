"use client";

import { useState } from "react";

/**
 * Owns the admin toast message; each notification hides itself after 4.5 s.
 * @returns {{toast: {message: string, type: string}|null, notify: (message: string, type?: "success"|"error") => void}}
 */
export function useAdminToast() {
  const [toast, setToast] = useState(null);

  const notify = (message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 4500);
  };

  return { toast, notify };
}
