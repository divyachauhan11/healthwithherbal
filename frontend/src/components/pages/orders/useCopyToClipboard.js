"use client";
import { useState } from "react";

/**
 * Copies text to the clipboard and raises a `copied` flag that resets after a
 * delay (for "Copy" → "Copied" button feedback).
 * @param {number} [resetAfterMs=2500] How long `copied` stays true.
 * @returns {{copied: boolean, copy: (text?: string) => void}} `copy` ignores empty text.
 */
export function useCopyToClipboard(resetAfterMs = 2500) {
  const [copied, setCopied] = useState(false);

  const copy = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), resetAfterMs);
    }
  };

  return { copied, copy };
}
