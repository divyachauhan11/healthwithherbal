import { ArrowLeft, RefreshCw } from "lucide-react";

/**
 * Header actions of the low-stock panel: back to the dashboard and refresh.
 * @param {{onNavigate?: (page: string) => void, onRefresh?: () => void}} props
 */
export function LowStockPanelActions({ onNavigate, onRefresh }) {
  return (
    <div className="low-stock-panel-actions">
      <button
        type="button"
        className="text-button low-stock-header-action"
        onClick={() => onNavigate?.("Dashboard")}
      >
        <ArrowLeft size={15} /> Dashboard
      </button>
      <button
        type="button"
        className="text-button low-stock-header-action"
        onClick={() => onRefresh?.()}
        title="Refresh list"
      >
        <RefreshCw size={14} /> Refresh
      </button>
    </div>
  );
}
