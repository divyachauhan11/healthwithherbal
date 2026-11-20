"use client";

import { useMemo } from "react";
import { ChartBarColumn } from "./ChartBarColumn";
import { ChartGridLines } from "./ChartGridLines";
import { ChartXAxis } from "./ChartXAxis";
import { ChartYAxis } from "./ChartYAxis";
import { DashboardPanel } from "./DashboardPanel";
import { SalesChartPeriod } from "./SalesChartPeriod";
import { buildSalesChart } from "./sales-chart-utils";

/**
 * Dashboard bar chart of revenue over the last seven days.
 * @param {{dailyRevenue?: Array<{_id: string, revenue?: number, orders?: number}>}} props
 */
export function SalesPerformanceChart({ dailyRevenue = [] }) {
  const chart = useMemo(() => buildSalesChart(dailyRevenue), [dailyRevenue]);

  return (
    <DashboardPanel title="Sales performance" description="Revenue over the last 7 days" className="sales" action={<SalesChartPeriod total={chart.total} />}>
      <div className="admin-chart">
        <ChartYAxis ticks={chart.ticks} />
        <div className="chart-stage">
          <div className="chart-plot-area">
            <ChartGridLines ticks={chart.ticks} />
            <div className="chart-bars-container">{chart.days.map((day) => (
              <ChartBarColumn key={day.key} day={day} ceiling={chart.ceiling} />
            ))}</div>
          </div>
          <ChartXAxis days={chart.days} />
        </div>
      </div>
    </DashboardPanel>
  );
}
