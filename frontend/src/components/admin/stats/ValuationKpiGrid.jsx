import { currency } from "../global/admin-utils";
import { ValuationKpiTile } from "./ValuationKpiTile";

/**
 * Total value, physical units and average unit price tiles.
 * @param {{inventory: Object}} props Result of summarizeInventory().
 */
export function ValuationKpiGrid({ inventory }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "10px",
        marginBottom: "20px",
      }}
    >
      <ValuationKpiTile label="Total Value" value={currency(inventory.inventoryVal)} color="#17483d" />
      <ValuationKpiTile label="Physical Units" value={inventory.totalUnits.toLocaleString()} color="#28342f" />
      <ValuationKpiTile label="Avg Unit Price" value={currency(inventory.avgUnitPrice)} color="#b47818" />
    </div>
  );
}
