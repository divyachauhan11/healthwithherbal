import { Loader2 } from "lucide-react";

export function AccountLoadingState({ message, size = 28 }) {
  return (
    <div className="account-loading-box" role="status" aria-live="polite">
      <Loader2 size={size} className="spin-animate" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
