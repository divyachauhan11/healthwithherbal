"use client";
import { useState } from "react";

/**
 * Owns the storefront toast message. `notify` shows a message and clears it
 * 2.2 s later.
 * @returns {{toast: string, notify: (message: string) => void}}
 */
export function useToast() {
  const [toast, setToast] = useState("");

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  return { toast, notify };
}
