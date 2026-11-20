"use client";

import { CategoryDonut } from "./CategoryDonut";
import { CategoryLegend } from "./CategoryLegend";
import { DashboardPanel } from "./DashboardPanel";
import { SalesModeToggle } from "./SalesModeToggle";
import { useSalesByCategory } from "./useSalesByCategory";

/**
 * Dashboard donut of sales by category for this month or all time.
 * @param {{dashboard?: Object}} props Dashboard API payload.
 */
export function SalesByCategory({ dashboard }) {
  const { mode, setMode, items, displayTotal, conicGradient } = useSalesByCategory(dashboard);

  return (
    <DashboardPanel
      title="Sales by category"
      description={mode === "all" ? "All time orders" : "This month"}
      className="category"
      action={<SalesModeToggle mode={mode} onChange={setMode} />}
    >
      <div className="donut-wrap">
        <CategoryDonut gradient={conicGradient} total={displayTotal} />
        <CategoryLegend items={items} />
      </div>
    </DashboardPanel>
  );
}
