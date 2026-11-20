import { X } from "lucide-react";
import { StockHealthBreakdown } from "./StockHealthBreakdown";
import { ValuationKpiGrid } from "./ValuationKpiGrid";
import { ValuationModalActions } from "./ValuationModalActions";

/**
 * Warehouse valuation and stock health breakdown dialog.
 * @param {{inventory: Object, onClose: () => void, onManageLowStock: () => void}} props
 */
export function InventoryValuationModal({ inventory, onClose, onManageLowStock }) {
  return (
    <div
      className="admin-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="admin-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "560px" }}
      >
        <div className="admin-modal-header">
          <div>
            <h2>Warehouse Valuation & Stock Breakdown</h2>
            <p>Live inventory appraisal and stock health analysis</p>
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="admin-modal-body" style={{ padding: "20px" }}>
          {/* Top 3 KPI Pillars */}
          <ValuationKpiGrid inventory={inventory} />

          {/* Stock Health Progress Bar */}
          <StockHealthBreakdown inventory={inventory} />

          {/* Quick Actions Footer */}
          <ValuationModalActions onClose={onClose} onManageLowStock={onManageLowStock} />
        </div>
      </div>
    </div>
  );
}
