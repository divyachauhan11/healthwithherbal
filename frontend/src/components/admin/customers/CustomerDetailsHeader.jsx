import { X } from "lucide-react";

/**
 * Header of the customer details dialog with the customer's name and a close button.
 * @param {{name?: string, onClose: () => void}} props
 */
export function CustomerDetailsHeader({ name, onClose }) {
  return (
    <header className="customer-details-header">
      <div>
        <span className="customer-details-eyebrow">Customer profile</span>
        <h2>{name || "Customer details"}</h2>
        <p>Profile, order history, and payment records</p>
      </div>
      <button type="button" className="customer-details-close" onClick={onClose} aria-label="Close customer details"><X size={19} /></button>
    </header>
  );
}
