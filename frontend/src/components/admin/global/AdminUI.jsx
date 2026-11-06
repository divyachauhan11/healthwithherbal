import { useState, useMemo, useEffect } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Check,
  EyeOff,
  MoreHorizontal,
  Package,
  Search,
  Truck,
  AlertTriangle,
  TrendingUp,
  Users,
  X,
  Boxes,
  FolderTree,
  HeartPulse,
} from "lucide-react";
import { currency } from "./admin-utils";

export function Login({ onLogin, busy, error }) {
  return (
    <main className="admin-login-wrap">
      <form className="admin-login" onSubmit={onLogin}>
        <div className="admin-login-logo-card">
          <img
            src="/admin-login-logo.png"
            alt="Health With Herbal"
            className="admin-login-logo-img"
          />
        </div>
        <span className="eyebrow">ADMIN PORTAL</span>
        <h1>Welcome back</h1>
        <p>Sign in to manage your store.</p>
        {error && <div className="admin-alert">{error}</div>}
        <label>
          Email address
          <input
            name="email"
            type="email"
            autoComplete="username"
            placeholder="admin@yourstore.com"
            required
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            required
          />
        </label>
        <button className="primary" disabled={busy}>
          {busy ? "Signing in…" : "Sign in to admin"}
          <ArrowRight size={16} />
        </button>
        <small>Your session is secured and expires after 8 hours.</small>
      </form>
    </main>
  );
}

export function StatCard({
  id,
  label,
  title,
  value,
  badge,
  pulseDot,
  pulseAlert,
  icon: Icon,
  sub,
  hint,
  tone = "forest",
  onClick,
}) {
  const displayLabel = label || title;
  const isClickable = Boolean(onClick);

  return (
    <article
      key={id}
      className={`stat-card tone-${tone} ${isClickable ? "is-clickable" : ""}`}
      onClick={onClick}
      title={`${displayLabel}: ${value}`}
    >
      <div className="stat-top">
        <span className="stat-label">{displayLabel}</span>
        {badge && (
          <span className="stat-badge">
            {pulseDot && <span className="stat-pulse-dot" />}
            {pulseAlert && <span className="stat-pulse-alert" />}
            {badge}
          </span>
        )}
      </div>

      <div className="stat-middle">
        <strong className="stat-value">{value}</strong>
        {Icon && (
          <div className="mini-stat-icon">
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="stat-bottom">
        <span>{sub}</span>
        {hint && (
          <span className="stat-action-hint">
            {hint} <ArrowUpRight size={12} />
          </span>
        )}
      </div>
    </article>
  );
}

export function Metric(props) {
  return <StatCard {...props} />;
}

export function Empty({ children }) {
  return <div className="admin-empty">{children}</div>;
}

export function SearchField({ value, onChange, placeholder = "Search…" }) {
  return (
    <label className="search small">
      <Search size={16} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

export function PageStats({
  page,
  stats = {},
  rows = [],
  allRows = [],
  catalog = {},
  onNavigate,
  query = "",
  setQuery,
}) {
  const [valuationModal, setValuationModal] = useState(false);

  const targetRows = allRows.length
    ? allRows
    : rows.length
      ? rows
      : page === "Categories"
        ? catalog?.categories || []
        : page === "Brands"
          ? catalog?.brands || []
          : [];
  const inventoryVal = targetRows.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.stockQty || 0),
    0,
  );
  const totalUnits = targetRows.reduce(
    (sum, item) => sum + Number(item.stockQty || 0),
    0,
  );
  const outOfStockItems = targetRows.filter(
    (item) => Number(item.stockQty || 0) === 0,
  );
  const criticalStockItems = targetRows.filter(
    (item) => Number(item.stockQty || 0) > 0 && Number(item.stockQty || 0) <= 4,
  );
  const safeStockItems = targetRows.filter(
    (item) => Number(item.stockQty || 0) >= 5,
  );
  const avgUnitPrice =
    targetRows.length > 0
      ? targetRows.reduce((sum, item) => sum + Number(item.price || 0), 0) /
        targetRows.length
      : 0;

  const totalCatalogCount = stats.productCount || targetRows.length;
  const activeCount =
    stats.activeProducts ?? targetRows.filter((p) => p.active !== false).length;
  const activePct =
    totalCatalogCount > 0
      ? Math.round((activeCount / totalCatalogCount) * 100)
      : 100;

  let cards = [];

  if (page === "Dashboard") {
    cards = [
      {
        id: "dash_revenue",
        label: "Revenue",
        value: currency(stats.revenue),
        badge: "All time",
        sub: "All non-cancelled orders",
        tone: "forest",
        icon: ArrowDownToLine,
        onClick: onNavigate ? () => onNavigate("Orders") : undefined,
        hint: onNavigate ? "Orders" : undefined,
      },
      {
        id: "dash_orders",
        label: "Orders",
        value: stats.orderCount ?? 0,
        badge:
          (stats.pendingOrders ?? 0) > 0
            ? `${stats.pendingOrders} pending`
            : "All clear",
        pulseAlert: (stats.pendingOrders ?? 0) > 0,
        sub:
          (stats.pendingOrders ?? 0) > 0
            ? `${stats.pendingOrders} need attention`
            : "All orders fulfilled",
        tone: "amber",
        icon: Truck,
        onClick: onNavigate ? () => onNavigate("Orders") : undefined,
        hint:
          (stats.pendingOrders ?? 0) > 0 && onNavigate ? "Fulfill" : undefined,
      },
      {
        id: "dash_products",
        label: "Active products",
        value: stats.activeProducts ?? 0,
        badge:
          (stats.lowStock ?? 0) > 0 ? `${stats.lowStock} alerts` : "Healthy",
        pulseAlert: (stats.lowStock ?? 0) > 0,
        sub:
          (stats.lowStock ?? 0) > 0
            ? `${stats.lowStock} low stock`
            : "Inventory healthy",
        tone: "gold",
        icon: Package,
        onClick: onNavigate ? () => onNavigate("Products") : undefined,
        hint: onNavigate ? "Products" : undefined,
      },
      {
        id: "dash_customers",
        label: "Customers",
        value: stats.customerCount ?? 0,
        badge:
          (stats.pendingReviews ?? 0) > 0
            ? `${stats.pendingReviews} new`
            : "Registered",
        pulseAlert: (stats.pendingReviews ?? 0) > 0,
        sub:
          (stats.pendingReviews ?? 0) > 0
            ? `${stats.pendingReviews} reviews to approve`
            : "Active customer base",
        tone: "blue",
        icon: Users,
        onClick:
          onNavigate && (stats.pendingReviews ?? 0) > 0
            ? () => onNavigate("Reviews")
            : onNavigate
              ? () => onNavigate("Customers")
              : undefined,
        hint:
          (stats.pendingReviews ?? 0) > 0 && onNavigate
            ? "Moderate"
            : onNavigate
              ? "View buyers"
              : undefined,
      },
    ];
  } else if (page === "Products") {
    cards = [
      {
        id: "prod_all",
        label: "Products",
        value: totalCatalogCount,
        badge: "All items",
        sub: "Total in catalog",
        tone: "forest",
        icon: Package,
      },
      {
        id: "prod_active",
        label: "Active",
        value: activeCount,
        badge: `${activePct}% live`,
        pulseDot: true,
        sub: "Storefront visible",
        tone: "emerald",
        icon: Check,
      },
      {
        id: "prod_low_stock",
        label: "Low stock",
        value: stats.lowStock ?? 0,
        badge:
          (stats.lowStock ?? 0) > 0 ? `${stats.lowStock} alerts` : "Healthy",
        pulseAlert: (stats.lowStock ?? 0) > 0,
        sub: (stats.lowStock ?? 0) > 0 ? "Needs replenishment" : "Stock safe",
        tone: "amber",
        icon: AlertTriangle,
        onClick:
          (stats.lowStock ?? 0) > 0 && onNavigate
            ? () => onNavigate("Low Stock")
            : undefined,
        hint: (stats.lowStock ?? 0) > 0 && onNavigate ? "Restock" : undefined,
      },
      {
        id: "prod_value",
        label: "Inventory value",
        value: currency(inventoryVal),
        badge: `${totalUnits.toLocaleString()} units`,
        sub: "Warehouse retail worth",
        tone: "gold",
        icon: TrendingUp,
        onClick: () => setValuationModal(true),
        hint: "Breakdown",
      },
    ];
  } else if (page === "Orders") {
    cards = [
      {
        id: "orders_all",
        label: "Total orders",
        value: stats.orderCount ?? 0,
        badge: "All time",
        sub: "Across all channels",
        tone: "forest",
        icon: Truck,
      },
      {
        id: "orders_pending",
        label: "Needs attention",
        value: stats.pendingOrders ?? 0,
        badge:
          (stats.pendingOrders ?? 0) > 0
            ? `${stats.pendingOrders} pending`
            : "All clear",
        pulseAlert: (stats.pendingOrders ?? 0) > 0,
        sub:
          (stats.pendingOrders ?? 0) > 0
            ? "Awaiting fulfillment"
            : "All orders fulfilled",
        tone: "amber",
        icon: AlertTriangle,
      },
      {
        id: "orders_customers",
        label: "Customers",
        value: stats.customerCount ?? 0,
        badge: "Registered",
        sub: "Active customer base",
        tone: "blue",
        icon: Package,
        onClick: onNavigate ? () => onNavigate("Customers") : undefined,
        hint: onNavigate ? "View buyers →" : undefined,
      },
      {
        id: "orders_revenue",
        label: "Revenue",
        value: currency(stats.revenue),
        badge: "Gross sales",
        sub: "All verified orders",
        tone: "gold",
        icon: TrendingUp,
      },
    ];
  } else if (page === "Reviews") {
    cards = [
      {
        id: "rev_all",
        label: "Reviews",
        value: stats.reviewCount ?? 0,
        badge: "Feedback",
        sub: "Customer opinions",
        tone: "forest",
        icon: Package,
      },
      {
        id: "rev_pending",
        label: "Awaiting approval",
        value: stats.pendingReviews ?? 0,
        badge:
          (stats.pendingReviews ?? 0) > 0
            ? `${stats.pendingReviews} new`
            : "Clean",
        pulseAlert: (stats.pendingReviews ?? 0) > 0,
        sub:
          (stats.pendingReviews ?? 0) > 0
            ? "Needs moderation"
            : "All reviews processed",
        tone: "amber",
        icon: AlertTriangle,
      },
      {
        id: "rev_products",
        label: "Products",
        value: stats.productCount ?? 0,
        badge: "Catalog",
        sub: "Reviewed products",
        tone: "blue",
        icon: Check,
        onClick: onNavigate ? () => onNavigate("Products") : undefined,
        hint: onNavigate ? "Products →" : undefined,
      },
      {
        id: "rev_customers",
        label: "Customers",
        value: stats.customerCount ?? 0,
        badge: "Reviewers",
        sub: "Contributing buyers",
        tone: "gold",
        icon: TrendingUp,
        onClick: onNavigate ? () => onNavigate("Customers") : undefined,
        hint: onNavigate ? "Customers →" : undefined,
      },
    ];
  } else if (page === "Customers") {
    cards = [
      {
        id: "cust_all",
        label: "Customers",
        value: stats.customerCount ?? 0,
        badge: "Store buyers",
        sub: "Total unique shoppers",
        tone: "forest",
        icon: Package,
      },
      {
        id: "cust_orders",
        label: "Total orders",
        value: stats.orderCount ?? 0,
        badge: "Purchases",
        sub: "Orders placed",
        tone: "emerald",
        icon: Truck,
        onClick: onNavigate ? () => onNavigate("Orders") : undefined,
        hint: onNavigate ? "Orders →" : undefined,
      },
      {
        id: "cust_rev",
        label: "Revenue",
        value: currency(stats.revenue),
        badge: "Lifetime value",
        sub: "Total customer spend",
        tone: "gold",
        icon: TrendingUp,
      },
      {
        id: "cust_revs",
        label: "Reviews",
        value: stats.reviewCount ?? 0,
        badge: "Feedback",
        sub: "Ratings submitted",
        tone: "blue",
        icon: Check,
        onClick: onNavigate ? () => onNavigate("Reviews") : undefined,
        hint: onNavigate ? "Reviews →" : undefined,
      },
    ];
  } else if (page === "Categories") {
    const totalCategories = targetRows.length;
    const activeCategories = targetRows.filter(
      (c) => c.isActive !== false,
    ).length;
    const activePct =
      totalCategories > 0
        ? Math.round((activeCategories / totalCategories) * 100)
        : 100;
    const hiddenCategories = targetRows.filter(
      (c) => c.isActive === false,
    );
    const isHiddenFiltered = query.trim().toLowerCase() === "hidden";
    const lowStockCount = stats.lowStock ?? 0;

    cards = [
      {
        id: "cat_all",
        label: "Categories",
        value: totalCategories,
        badge: query ? "Filtered" : "All items",
        pulseAlert: Boolean(query),
        sub: query ? `Filter: "${query}"` : "Total in catalog",
        tone: "forest",
        icon: FolderTree,
        onClick: query && setQuery ? () => setQuery("") : undefined,
        hint: query ? "Clear" : undefined,
      },
      {
        id: "cat_active",
        label: "Active",
        value: activeCategories,
        badge: `${activePct}% live`,
        pulseDot: true,
        sub: "Storefront visible",
        tone: "emerald",
        icon: Check,
      },
      {
        id: "cat_hidden",
        label: "Hidden",
        value: hiddenCategories.length,
        badge: isHiddenFiltered
          ? "Active filter"
          : `${hiddenCategories.length} hidden`,
        pulseAlert: hiddenCategories.length > 0,
        sub: "Paused from storefront",
        tone: "amber",
        icon: EyeOff,
        onClick: setQuery
          ? () => setQuery(isHiddenFiltered ? "" : "hidden")
          : undefined,
        hint: isHiddenFiltered ? "Clear" : "Filter",
      },
      {
        id: "cat_low_stock",
        label: "Low stock",
        value: lowStockCount,
        badge: lowStockCount > 0 ? `${lowStockCount} alerts` : "Healthy",
        pulseAlert: lowStockCount > 0,
        sub:
          lowStockCount > 0
            ? `${lowStockCount} items need reorder`
            : "Inventory healthy",
        tone: "gold",
        icon: AlertTriangle,
        onClick: onNavigate ? () => onNavigate("Low Stock") : undefined,
        hint: onNavigate ? "Restock →" : undefined,
      },
    ];
  } else if (page === "Brands") {
    const totalBrands = targetRows.length;
    const activeBrands = targetRows.filter((b) => b.isActive !== false).length;
    const activePct =
      totalBrands > 0 ? Math.round((activeBrands / totalBrands) * 100) : 100;
    const withImages = targetRows.filter(
      (b) =>
        b.image ||
        b.logoUrl ||
        (Array.isArray(b.images) && b.images.length > 0),
    ).length;

    cards = [
      {
        id: "brand_all",
        label: "Brands",
        value: totalBrands,
        badge: query ? "Filtered" : "All items",
        pulseAlert: Boolean(query),
        sub: query ? `Filter: "${query}"` : "Total in catalog",
        tone: "forest",
        icon: Package,
        onClick: query && setQuery ? () => setQuery("") : undefined,
        hint: query ? "Clear" : undefined,
      },
      {
        id: "brand_active",
        label: "Active",
        value: activeBrands,
        badge: `${activePct}% live`,
        pulseDot: true,
        sub: "Storefront visible",
        tone: "emerald",
        icon: Check,
      },
      {
        id: "brand_logos",
        label: "Branded Media",
        value: withImages,
        badge: `${withImages} with logo`,
        sub: "Verified brand identity",
        tone: "amber",
        icon: TrendingUp,
      },
      {
        id: "brand_catalog",
        label: "Ayurvedic Makers",
        value: totalBrands,
        badge: "Trusted partners",
        sub: "Certified herbal houses",
        tone: "gold",
        icon: Boxes,
      },
    ];
  }

  if (!cards.length) return null;

  return (
    <>
      <section className="page-stats">
        {cards.map((c) => (
          <StatCard key={c.id} {...c} />
        ))}
      </section>

      {/* Interactive Inventory Valuation Breakdown Modal */}
      {valuationModal && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setValuationModal(false)}
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
                onClick={() => setValuationModal(false)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ padding: "20px" }}>
              {/* Top 3 KPI Pillars */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    background: "#faf8f4",
                    border: "1px solid #e7dfd4",
                    borderRadius: "10px",
                    padding: "12px",
                  }}
                >
                  <small
                    style={{
                      color: "#77837d",
                      fontSize: "11px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                    }}
                  >
                    Total Value
                  </small>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#17483d",
                      marginTop: "4px",
                    }}
                  >
                    {currency(inventoryVal)}
                  </div>
                </div>

                <div
                  style={{
                    background: "#faf8f4",
                    border: "1px solid #e7dfd4",
                    borderRadius: "10px",
                    padding: "12px",
                  }}
                >
                  <small
                    style={{
                      color: "#77837d",
                      fontSize: "11px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                    }}
                  >
                    Physical Units
                  </small>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#28342f",
                      marginTop: "4px",
                    }}
                  >
                    {totalUnits.toLocaleString()}
                  </div>
                </div>

                <div
                  style={{
                    background: "#faf8f4",
                    border: "1px solid #e7dfd4",
                    borderRadius: "10px",
                    padding: "12px",
                  }}
                >
                  <small
                    style={{
                      color: "#77837d",
                      fontSize: "11px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                    }}
                  >
                    Avg Unit Price
                  </small>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#b47818",
                      marginTop: "4px",
                    }}
                  >
                    {currency(avgUnitPrice)}
                  </div>
                </div>
              </div>

              {/* Stock Health Progress Bar */}
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
                    {targetRows.length} total SKUs
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
                  <div
                    style={{
                      width: `${(safeStockItems.length / (targetRows.length || 1)) * 100}%`,
                      background: "#10b981",
                    }}
                    title={`Safe stock: ${safeStockItems.length}`}
                  />
                  <div
                    style={{
                      width: `${(criticalStockItems.length / (targetRows.length || 1)) * 100}%`,
                      background: "#f59e0b",
                    }}
                    title={`Critical stock: ${criticalStockItems.length}`}
                  />
                  <div
                    style={{
                      width: `${(outOfStockItems.length / (targetRows.length || 1)) * 100}%`,
                      background: "#ef4444",
                    }}
                    title={`Out of stock: ${outOfStockItems.length}`}
                  />
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
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <i
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#10b981",
                        display: "inline-block",
                      }}
                    />
                    Healthy (5+): <b>{safeStockItems.length}</b>
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <i
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#f59e0b",
                        display: "inline-block",
                      }}
                    />
                    Low (1-4): <b>{criticalStockItems.length}</b>
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <i
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#ef4444",
                        display: "inline-block",
                      }}
                    />
                    Out of stock: <b>{outOfStockItems.length}</b>
                  </span>
                </div>
              </div>

              {/* Quick Actions Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  paddingTop: "14px",
                  borderTop: "1px solid #ebe5dc",
                }}
              >
                <button
                  type="button"
                  className="outline"
                  onClick={() => setValuationModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="primary"
                  onClick={() => {
                    setValuationModal(false);
                    onNavigate?.("Low Stock");
                  }}
                >
                  Manage Low Stock Items <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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
export function MetricsSection({ items = [], className = "page-stats" }) {
  return (
    <section className={className}>
      {items.map((item) => (
        <StatCard
          key={item.id || item.label || item.title}
          label={item.label || item.title}
          {...item}
        />
      ))}
    </section>
  );
}
