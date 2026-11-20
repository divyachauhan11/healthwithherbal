import { ArrowRight } from "lucide-react";

/**
 * Footer buttons of the valuation breakdown: close, or jump to low stock items.
 * @param {{onClose: () => void, onManageLowStock: () => void}} props
 */
export function ValuationModalActions({ onClose, onManageLowStock }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        paddingTop: "14px",
        borderTop: "1px solid #ebe5dc",
      }}
    >
      <button
        type="button"
        className="outline"
        onClick={onClose}
      >
        Close
      </button>
      <button
        type="button"
        className="primary"
        onClick={onManageLowStock}
      >
        Manage Low Stock Items <ArrowRight size={14} />
      </button>
    </div>
  );
}
