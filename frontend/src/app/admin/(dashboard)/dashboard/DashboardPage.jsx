import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ChevronRight,
  Package,
  Truck,
  Users,
} from "lucide-react";
import {
  Empty,
  PageStats,
  MetricsSection,
  SalesByCategory,
  currency,
} from "../../../../components/admin/global";
import { OrderTable } from "../../../../components/admin/custom";

function formatYAxis(value) {
  if (value === 0) return "₹0";
  if (value >= 10000000) {
    const val = value / 10000000;
    return `₹${val % 1 === 0 ? val : val.toFixed(1)}Cr`;
  }
  if (value >= 100000) {
    const val = value / 100000;
    return `₹${val % 1 === 0 ? val : val.toFixed(1)}L`;
  }
  if (value >= 1000) {
    const val = value / 1000;
    return `₹${val % 1 === 0 ? val : val.toFixed(1)}k`;
  }
  return `₹${Math.round(value)}`;
}

function SalesPerformanceChart({ dailyRevenue }) {
  const chartData = useMemo(() => {
    const daily = dailyRevenue || [];
    const map = new Map();

    daily.forEach((entry) => {
      if (entry && entry._id) {
        const key = String(entry._id).slice(0, 10);
        map.set(key, {
          revenue: Number(entry.revenue) || 0,
          orders: Number(entry.orders) || 0,
        });
      }
    });

    const today = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const dateNum = String(d.getDate()).padStart(2, "0");
      const localKey = `${year}-${month}-${dateNum}`;
      const utcKey = d.toISOString().slice(0, 10);

      const found = map.get(localKey) ||
        map.get(utcKey) || { revenue: 0, orders: 0 };
      days.push({
        _id: localKey,
        date: d,
        weekday: d.toLocaleDateString("en", { weekday: "short" }),
        dateFormatted: d.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),
        revenue: found.revenue,
        orders: found.orders,
        isToday: i === 0,
      });
    }

    const maxRev = Math.max(0, ...days.map((d) => d.revenue));
    const totalRev = days.reduce((sum, d) => sum + d.revenue, 0);

    let yMax = 100;
    let step = 33.33;
    if (maxRev <= 0) {
      yMax = 100;
      step = yMax / 3;
    } else {
      const targetInterval = (maxRev * 1.15) / 3;
      const pow = Math.pow(10, Math.floor(Math.log10(targetInterval || 1)));
      const fraction = targetInterval / pow;
      const niceFractions = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
      const niceFraction = niceFractions.find((f) => f >= fraction) || 10;
      step = niceFraction * pow;
      yMax = step * 3;
      while (yMax < maxRev) {
        step += pow;
        yMax = step * 3;
      }
    }

    const ticks = [
      { val: yMax, top: "0%" },
      { val: Math.round(step * 2), top: "33.333%" },
      { val: Math.round(step * 1), top: "66.667%" },
      { val: 0, top: "100%" },
    ];

    return {
      days,
      maxRevenue: maxRev,
      totalRevenue: totalRev,
      yMax,
      ticks,
    };
  }, [dailyRevenue]);

  return (
    <article className="panel sales">
      <div className="panel-head">
        <div>
          <h2>Sales performance</h2>
          <p>Revenue over the last 7 days</p>
        </div>
        <span className="panel-period">
          Last 7 days
          {chartData.totalRevenue > 0
            ? ` · ${currency(chartData.totalRevenue, "INR")}`
            : ""}
        </span>
      </div>
      <div className="admin-chart">
        <div className="chart-y-axis" aria-hidden="true">
          {chartData.ticks.map((tick, i) => (
            <span key={i} className="chart-y-label" style={{ top: tick.top }}>
              {formatYAxis(tick.val)}
            </span>
          ))}
        </div>

        <div className="chart-stage">
          <div className="chart-plot-area">
            <div className="chart-grid-lines" aria-hidden="true">
              {chartData.ticks.map((tick, i) => (
                <div
                  key={i}
                  className={`chart-grid-line ${tick.val === 0 ? "baseline" : ""}`}
                  style={{ top: tick.top }}
                />
              ))}
            </div>

            <div className="chart-bars-container">
              {chartData.days.map((day) => {
                const heightPct =
                  chartData.yMax > 0
                    ? Math.min(
                        100,
                        Math.max(0, (day.revenue / chartData.yMax) * 100),
                      )
                    : 0;
                return (
                  <div key={day._id} className="chart-bar-column">
                    <div className="chart-bar-slot">
                      {heightPct > 0 ? (
                        <div
                          className="chart-bar-fill"
                          style={{ height: `${heightPct}%` }}
                          tabIndex={0}
                          aria-label={`${day.dateFormatted}: ${currency(day.revenue, "INR")} (${day.orders} ${day.orders === 1 ? "order" : "orders"})`}
                        >
                          <div className="chart-bar-tooltip">
                            <span className="tooltip-amount">
                              {currency(day.revenue, "INR")}
                            </span>
                            <span className="tooltip-sub">
                              {day.orders}{" "}
                              {day.orders === 1 ? "order" : "orders"} ·{" "}
                              {day.dateFormatted}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="chart-bar-zero"
                          tabIndex={0}
                          aria-label={`${day.dateFormatted}: ₹0`}
                        >
                          <div className="chart-bar-tooltip">
                            <span className="tooltip-amount">₹0</span>
                            <span className="tooltip-sub">
                              0 orders · {day.dateFormatted}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="chart-x-axis">
            {chartData.days.map((day) => (
              <div key={day._id} className="chart-x-col">
                <span
                  className={`chart-day-label ${day.isToday ? "today" : ""}`}
                >
                  {day.weekday}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function DashboardPage({
  dashboard,
  stats,
  onNavigate,
  onRefresh,
}) {
  // All low stock products (respects custom lowStockThreshold or defaults to 10)
  const allLowStock = useMemo(() => {
    const list = dashboard.lowStockProducts || [];
    return list.filter((p) => {
      const qty = Number(p.stockQty ?? 0);
      const threshold =
        p.lowStockThreshold !== undefined && p.lowStockThreshold !== null
          ? Number(p.lowStockThreshold)
          : 10;
      return qty <= threshold;
    });
  }, [dashboard.lowStockProducts]);

  const displayedStock = allLowStock.slice(0, 7);

  const totalActive = stats.activeProducts || (dashboard.catalogCategories?.reduce((s, c) => s + c.count, 0) || 0);
  const lowStockPct = totalActive > 0 ? Math.round((allLowStock.length / totalActive) * 100) : 0;

  return (
    <>
      <PageStats
        page="Dashboard"
        stats={stats}
        onNavigate={onNavigate}
      />
      <section className="dashboard-grid">
        <SalesPerformanceChart dailyRevenue={dashboard.dailyRevenue} />
        <SalesByCategory dashboard={dashboard} />
        <article className="panel recent">
          <div className="panel-head">
            <div>
              <h2>Recent orders</h2>
              <p>Latest customer purchases</p>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("Orders")}
            >
              View all <ChevronRight size={15} />
            </button>
          </div>
          <OrderTable
            rows={dashboard.recentOrders || []}
            compact
            onStatus={onRefresh}
          />
        </article>
        <article className="panel stock">
          <div className="panel-head">
            <div>
              <h2>Inventory alert</h2>
              <p>
                {allLowStock.length > 0
                  ? `${allLowStock.length} items (${lowStockPct}% of active catalog) need attention`
                  : "All active products are healthy and well-stocked"}
              </p>
            </div>
            <button
              type="button"
              className="text-button"
              onClick={() => onNavigate && onNavigate("Low Stock")}
            >
              View all {allLowStock.length > 0 ? `(${allLowStock.length})` : ""}
              <ChevronRight size={15} />
            </button>
          </div>
          <div className="stock-items-container">
            {displayedStock.length ? (
              displayedStock.map((product) => {
                const isOut = (product.stockQty ?? 0) === 0;
                const safeThreshold = product.lowStockThreshold || 10;
                const pct = isOut ? 0 : Math.min(100, Math.round(((product.stockQty ?? 0) / safeThreshold) * 100));

                return (
                  <div className="stock-row" key={product._id}>
                    <div
                      className="product-thumb"
                      style={{
                        background: "var(--forest, #3f6050)",
                        color: "#ffffff",
                      }}
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "6px",
                          }}
                        />
                      ) : (
                        product.title?.slice(0, 1)
                      )}
                    </div>
                    <div>
                      <b>{product.title}</b>
                      <span>{product.category}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                      <strong className={isOut ? "out" : ""}>
                        {isOut ? "Out" : `${product.stockQty} left`}
                      </strong>
                      <span style={{ fontSize: "9px", color: isOut ? "#a14e36" : "#8a948f", fontWeight: "600" }}>
                        {isOut ? "0% remaining" : `${pct}% of threshold (${safeThreshold})`}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <Empty>All active products are above their stock threshold.</Empty>
            )}
          </div>
          {allLowStock.length > 7 && (
            <div
              style={{
                padding: "11px 19px",
                borderTop: "1px dashed #e8e2d8",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#faf7f2",
                borderBottomLeftRadius: "10px",
                borderBottomRightRadius: "10px",
              }}
            >
              <span style={{ fontSize: "11px", color: "#69726e" }}>
                Showing top 7 of {allLowStock.length} low stock products (&lt; 10)
              </span>
              <button
                type="button"
                className="text-button"
                onClick={() => onNavigate && onNavigate("Low Stock")}
              >
                View all products <ChevronRight size={13} />
              </button>
            </div>
          )}
        </article>
      </section>
    </>
  );
}
