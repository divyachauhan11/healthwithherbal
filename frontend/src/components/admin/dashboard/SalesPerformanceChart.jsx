"use client";

import { useMemo } from "react";
import { currency } from "../global/admin-utils";
import { DashboardPanel } from "./DashboardPanel";

function formatYAxis(value) {
  if (!value) return "₹0";
  if (value >= 10000000) return `₹${Number((value / 10000000).toFixed(1))}Cr`;
  if (value >= 100000) return `₹${Number((value / 100000).toFixed(1))}L`;
  if (value >= 1000) return `₹${Number((value / 1000).toFixed(1))}k`;
  return `₹${Math.round(value)}`;
}

function shiftDateKey(dateKey, offset) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + offset));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}-${String(shifted.getUTCDate()).padStart(2, "0")}`;
}

function getStoreDateKey(value) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const date = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
  return `${date.year}-${date.month}-${date.day}`;
}

export function SalesPerformanceChart({ dailyRevenue = [] }) {
  const chart = useMemo(() => {
    const entries = new Map(dailyRevenue.filter((entry) => entry?._id).map((entry) => [String(entry._id).slice(0, 10), entry]));
    const lastDate = [...entries.keys()].sort().at(-1) || getStoreDateKey(new Date());
    const days = Array.from({ length: 7 }, (_, index) => {
      const key = shiftDateKey(lastDate, index - 6);
      const date = new Date(`${key}T12:00:00.000Z`);
      const entry = entries.get(key) || {};
      return { key, date, revenue: Number(entry.revenue) || 0, orders: Number(entry.orders) || 0, today: index === 6 };
    });
    const max = Math.max(0, ...days.map(({ revenue }) => revenue));
    const magnitude = 10 ** Math.floor(Math.log10(max / 3 || 1));
    const step = max > 0 ? magnitude * Math.ceil(max / 3 / magnitude) : 100;
    return { days, total: days.reduce((sum, day) => sum + day.revenue, 0), ceiling: step * 3, ticks: [step * 3, step * 2, step, 0] };
  }, [dailyRevenue]);

  return (
    <DashboardPanel title="Sales performance" description="Revenue over the last 7 days" className="sales" action={<span className="panel-period">Last 7 days{chart.total ? ` · ${currency(chart.total, "INR")}` : ""}</span>}>
      <div className="admin-chart">
        <div className="chart-y-axis" aria-hidden="true">{chart.ticks.map((tick, i) => <span key={i} className="chart-y-label" style={{ top: `${(i * 100) / 3}%` }}>{formatYAxis(tick)}</span>)}</div>
        <div className="chart-stage">
          <div className="chart-plot-area">
            <div className="chart-grid-lines" aria-hidden="true">{chart.ticks.map((tick, i) => <div key={i} className={`chart-grid-line ${i === 3 ? "baseline" : ""}`} style={{ top: `${(i * 100) / 3}%` }} />)}</div>
            <div className="chart-bars-container">{chart.days.map((day) => {
              const height = Math.min(100, (day.revenue / (chart.ceiling || 1)) * 100);
              const label = day.date.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
              return <div key={day.key} className="chart-bar-column"><div className="chart-bar-slot">{height > 0 ? <div className="chart-bar-fill" style={{ height: `${height}%` }} tabIndex={0} aria-label={`${label}: ${currency(day.revenue, "INR")}, ${day.orders} orders`}><div className="chart-bar-tooltip"><span className="tooltip-amount">{currency(day.revenue, "INR")}</span><span className="tooltip-sub">{day.orders} {day.orders === 1 ? "order" : "orders"} · {label}</span></div></div> : <div className="chart-bar-zero" tabIndex={0} aria-label={`${label}: ${currency(day.revenue, "INR")}, ${day.orders} ${day.orders === 1 ? "order" : "orders"}`}><div className="chart-bar-tooltip"><span className="tooltip-amount">{currency(day.revenue, "INR")}</span><span className="tooltip-sub">{day.orders} {day.orders === 1 ? "order" : "orders"} · {label}</span></div></div>}</div></div>;
            })}</div>
          </div>
          <div className="chart-x-axis">{chart.days.map((day) => <div key={day.key} className="chart-x-col"><span className={`chart-day-label ${day.today ? "today" : ""}`}>{day.date.toLocaleDateString("en", { weekday: "short", timeZone: "UTC" })}</span></div>)}</div>
        </div>
      </div>
    </DashboardPanel>
  );
}
