import { Check, X } from "lucide-react";

/**
 * Bottom toast for admin action results.
 * @param {{toast: {message: string, type: string}|null}} props Nothing renders without a toast.
 */
export function AdminToast({ toast }) {
  if (!toast) return null;
  return (
    <div
      className={`admin-toast ${toast.type === "error" ? "danger" : ""}`}
    >
      {toast.type === "error" ? (
        <X size={16} aria-hidden="true" />
      ) : (
        <Check size={16} />
      )}
      <span>{toast.message}</span>
    </div>
  );
}
