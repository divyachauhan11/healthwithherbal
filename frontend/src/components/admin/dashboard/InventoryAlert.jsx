"use client";

import { Empty } from "../global/Empty";
import { DashboardPanel } from "./DashboardPanel";
import { InventoryAlertFooter } from "./InventoryAlertFooter";
import { InventoryAlertRow } from "./InventoryAlertRow";
import { InventoryAlertViewAll } from "./InventoryAlertViewAll";
import { getInventoryAlertSummary } from "./inventory-alert-utils";
import { useInventoryAlert } from "./useInventoryAlert";

/**
 * Dashboard panel listing up to seven products at or below their stock threshold.
 * @param {Object} props
 * @param {Array<Object>} [props.products=[]] Low stock candidates.
 * @param {number} [props.activeProductCount=0] Active catalog size (for the percentage).
 * @param {() => void} [props.onViewAll] Opens the low stock page.
 */
export function InventoryAlert({ products = [], activeProductCount = 0, onViewAll }) {
  const { lowStock, visible, percentage } = useInventoryAlert(products, activeProductCount);

  return (
    <DashboardPanel title="Inventory alert" description={getInventoryAlertSummary(lowStock.length, percentage)} className="stock" action={<InventoryAlertViewAll count={lowStock.length} onViewAll={onViewAll} />}>
      <div className="stock-items-container">
        {visible.length ? visible.map((product) => (
          <InventoryAlertRow key={product._id} product={product} />
        )) : <Empty>All active products are above their stock threshold.</Empty>}
      </div>
      {lowStock.length > 7 && <InventoryAlertFooter total={lowStock.length} onViewAll={onViewAll} />}
    </DashboardPanel>
  );
}
