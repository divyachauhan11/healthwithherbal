import { useEffect } from "react";

/**
 * Calls `onClose` when Escape is pressed while `target` is set (e.g. while an
 * order is shown in the details view).
 * @param {*} target Value that is being shown; no listener when empty.
 * @param {() => void} onClose
 */
export function useCloseOnEscape(target, onClose) {
  useEffect(() => {
    if (!target) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [target, onClose]);
}
