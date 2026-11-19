"use client";

import { useMemo, useState } from "react";

const CATEGORY_PALETTE = [
  "#17483d",
  "#b65c3d",
  "#d09a2a",
  "#5f7883",
  "#744b82",
  "#2b6b66",
];

function calculateCategoryBreakdown(rawList) {
  if (!rawList || !rawList.length) return [];

  // Filter to items that actually have positive sales
  const valid = rawList.filter((item) => (item.revenue ?? item.count ?? 0) > 0);
  if (!valid.length) return [];

  const total = valid.reduce(
    (sum, item) => sum + (item.revenue ?? item.count ?? 0),
    0,
  );
  if (total <= 0) return [];

  // Sort descending by amount
  const sorted = [...valid].sort(
    (a, b) => (b.revenue ?? b.count ?? 0) - (a.revenue ?? a.count ?? 0),
  );

  // Group top 4 categories and place remaining into "Other"
  const top4 = sorted.slice(0, 4);
  const remainder = sorted.slice(4);
  const otherSum = remainder.reduce(
    (sum, it) => sum + (it.revenue ?? it.count ?? 0),
    0,
  );

  const items = top4.map((item, index) => ({
    name: item._id || "Other",
    amount: item.revenue ?? item.count ?? 0,
    units: item.units,
    color: CATEGORY_PALETTE[index % CATEGORY_PALETTE.length],
  }));

  if (otherSum > 0) {
    items.push({
      name: "Other",
      amount: otherSum,
      color: CATEGORY_PALETTE[4 % CATEGORY_PALETTE.length],
    });
  }

  // Exact math with Largest Remainder Method: guarantees percentages sum to EXACTLY 100%
  const computed = items.map((item) => {
    const rawPct = (item.amount / total) * 100;
    const floorPct = Math.floor(rawPct);
    return {
      ...item,
      rawPct,
      percentage: floorPct,
      fraction: rawPct - floorPct,
    };
  });

  const sumFloor = computed.reduce((sum, it) => sum + it.percentage, 0);
  const remainderPoints = 100 - sumFloor;

  // Distribute any rounding difference to the items with highest fractional parts
  const byFraction = computed
    .map((item, index) => ({
      index,
      fraction: item.fraction,
      amount: item.amount,
    }))
    .filter((entry) => entry.amount > 0)
    .sort((a, b) => b.fraction - a.fraction);

  for (let i = 0; i < remainderPoints && i < byFraction.length; i++) {
    computed[byFraction[i].index].percentage += 1;
  }

  return computed;
}

function formatExactPct(pct) {
  if (pct === undefined || pct === null || isNaN(pct) || pct <= 0) return "0%";
  if (pct >= 99.995 && pct < 100) return "99.99%";
  if (pct >= 100) return "100%";
  if (pct >= 10) return `${Number(pct.toFixed(1))}%`;
  if (pct >= 1) return `${Number(pct.toFixed(2))}%`;
  if (pct >= 0.01) return `${Number(pct.toFixed(2))}%`;
  if (pct >= 0.001) return `${Number(pct.toFixed(3))}%`;
  return `${Number(pct.toFixed(4))}%`;
}

export function SalesByCategory({ dashboard }) {
  const [mode, setMode] = useState("month");

  const currencySymbol = "₹";

  const formatCompact = (amount) => {
    const val = Number(amount || 0);
    if (val >= 10000000)
      return `${currencySymbol}${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `${currencySymbol}${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `${currencySymbol}${Math.round(val / 1000)}k`;
    return `${currencySymbol}${val.toLocaleString("en-IN")}`;
  };

  const monthRaw = dashboard?.monthSalesByCategory || [];
  const allRaw = dashboard?.salesByCategory || [];
  const catalogRaw = dashboard?.catalogCategories || [];

  const monthItems = useMemo(() => {
    if (monthRaw.length) return calculateCategoryBreakdown(monthRaw);
    if (allRaw.length) return calculateCategoryBreakdown(allRaw);
    return calculateCategoryBreakdown(catalogRaw);
  }, [monthRaw, allRaw, catalogRaw]);

  const allItems = useMemo(() => {
    if (allRaw.length) return calculateCategoryBreakdown(allRaw);
    return calculateCategoryBreakdown(catalogRaw);
  }, [allRaw, catalogRaw]);

  const items = mode === "all" ? allItems : monthItems;

  const monthTotal =
    dashboard?.stats?.monthRevenue ??
    monthRaw.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const allTotal =
    dashboard?.stats?.revenue ??
    allRaw.reduce((sum, item) => sum + (item.revenue || 0), 0);

  const displayTotal = formatCompact(mode === "all" ? allTotal : monthTotal);

  const conicGradient = useMemo(() => {
    if (!items || !items.length) {
      return "conic-gradient(#e5ebe7 0% 100%)";
    }
    let current = 0;
    const stops = items.map((item) => {
      const start = current;
      current += item.rawPct ?? item.percentage ?? 0;
      return `${item.color} ${start}% ${current}%`;
    });
    if (current < 100 && stops.length) {
      stops.push(`${items[items.length - 1].color} ${current}% 100%`);
    }
    return `conic-gradient(${stops.join(", ")})`;
  }, [items]);

  return (
    <article className="panel category">
      <div className="panel-head">
        <div>
          <h2>Sales by category</h2>
          <p>{mode === "all" ? "All time orders" : "This month"}</p>
        </div>
        <div
          style={{
            display: "flex",
            background: "#f0ece5",
            borderRadius: "6px",
            padding: "2px",
            gap: "2px",
          }}
        >
          <button
            type="button"
            onClick={() => setMode("month")}
            style={{
              padding: "4px 9px",
              fontSize: "11px",
              fontWeight: mode === "month" ? "700" : "500",
              border: "none",
              borderRadius: "4px",
              background: mode === "month" ? "#ffffff" : "transparent",
              color: mode === "month" ? "#1e2c1e" : "#69726e",
              boxShadow:
                mode === "month" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
              cursor: "pointer",
            }}
          >
            This month
          </button>
          <button
            type="button"
            onClick={() => setMode("all")}
            style={{
              padding: "4px 9px",
              fontSize: "11px",
              fontWeight: mode === "all" ? "700" : "500",
              border: "none",
              borderRadius: "4px",
              background: mode === "all" ? "#ffffff" : "transparent",
              color: mode === "all" ? "#1e2c1e" : "#69726e",
              boxShadow: mode === "all" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
              cursor: "pointer",
            }}
          >
            All time
          </button>
        </div>
      </div>
      <div className="donut-wrap">
        <div className="donut" style={{ background: conicGradient }}>
          <div className="donut-center">
            <strong
              className="donut-number"
              style={{
                fontFamily:
                  "'DM Sans', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontVariantNumeric: "tabular-nums",
                fontWeight: 700,
                letterSpacing: "-0.5px",
              }}
            >
              {displayTotal}
            </strong>
            <span>Total</span>
          </div>
        </div>
        <div className="legend">
          {items.map((item) => (
            <div
              key={item.name}
              className="legend-item"
              title={`${item.name}: ${formatExactPct(item.rawPct)} (${formatCompact(item.amount)})`}
            >
              <i style={{ backgroundColor: item.color }} />
              <span className="legend-label">{item.name}</span>
              <b className="legend-pct">{formatExactPct(item.rawPct)}</b>
            </div>
          ))}
          {!items.length && (
            <div
              className="legend-item"
              style={{ gridTemplateColumns: "1fr", color: "#8a948f" }}
            >
              <span>No sales data yet</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}