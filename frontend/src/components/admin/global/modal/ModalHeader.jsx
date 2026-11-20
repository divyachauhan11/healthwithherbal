import { X } from "lucide-react";

/**
 * Admin modal header: optional title and subtitle with a close button.
 * @param {object} props
 * @param {import("react").ReactNode} [props.title]
 * @param {import("react").ReactNode} [props.subtitle]
 * @param {boolean} props.busy Disables the close button.
 * @param {() => void} [props.onClose]
 */
export function ModalHeader({ title, subtitle, busy, onClose }) {
  return (
    <div className="admin-modal-header">
      <div>
        {title && <h2>{title}</h2>}
        {subtitle && <p>{subtitle}</p>}
      </div>
      <button
        type="button"
        className="admin-modal-close"
        onClick={onClose}
        disabled={busy}
        aria-label="Close modal"
      >
        <X size={16} />
      </button>
    </div>
  );
}
