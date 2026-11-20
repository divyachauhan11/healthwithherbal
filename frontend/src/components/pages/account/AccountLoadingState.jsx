import { Loader2 } from "lucide-react";

/**
 * Spinner with a message, announced politely to screen readers.
 * @param {object} props
 * @param {string} props.message Loading message.
 * @param {number} [props.size=28] Spinner size in px.
 */
export function AccountLoadingState({ message, size = 28 }) {
  return (
    <div className="account-loading-box" role="status" aria-live="polite">
      <Loader2 size={size} className="spin-animate" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
