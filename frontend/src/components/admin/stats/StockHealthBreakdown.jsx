import { StockHealthLegendItem } from "./StockHealthLegendItem";
import { StockHealthSegment } from "./StockHealthSegment";

/**
 * Inventory health bar (healthy / low / out of stock shares) with its legend.
 * @param {{inventory: Object}} props Result of summarizeInventory().
 */
export function StockHealthBreakdown({ inventory }) {
  const { safeStockItems, criticalStockItems, outOfStockItems, totalSkus } = inventory;

  return (
    <div style={{ marginBottom: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "6px",
          fontSize: "12px",
          fontWeight: "600",
        }}
      >
        <span>Inventory Health</span>
        <span style={{ color: "#66726c" }}>
          {totalSkus} total SKUs
        </span>
      </div>
      <div
        style={{
          display: "flex",
          height: "10px",
          borderRadius: "6px",
          overflow: "hidden",
          background: "#e5dfd5",
          gap: "2px",
        }}
      >
        <StockHealthSegment count={safeStockItems.length} total={totalSkus} color="#10b981" title={`Safe stock: ${safeStockItems.length}`} />
        <StockHealthSegment count={criticalStockItems.length} total={totalSkus} color="#f59e0b" title={`Critical stock: ${criticalStockItems.length}`} />
        <StockHealthSegment count={outOfStockItems.length} total={totalSkus} color="#ef4444" title={`Out of stock: ${outOfStockItems.length}`} />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "8px",
          fontSize: "11px",
          color: "#6b7570",
        }}
      >
        <StockHealthLegendItem color="#10b981" label="Healthy (5+): " count={safeStockItems.length} />
        <StockHealthLegendItem color="#f59e0b" label="Low (1-4): " count={criticalStockItems.length} />
        <StockHealthLegendItem color="#ef4444" label="Out of stock: " count={outOfStockItems.length} />
      </div>
    </div>
  );
}
