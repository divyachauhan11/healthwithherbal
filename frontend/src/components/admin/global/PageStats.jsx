import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  EyeOff,
  Package,
  Truck,
  AlertTriangle,
  TrendingUp,
  Users,
  X,
  Boxes,
  FolderTree,
  HeartPulse,
  RotateCcw,
  Clock3,
  PackageCheck,
} from "lucide-react";
import { currency } from "./admin-utils";
import { RETURN_EXCHANGE_STATUSES } from "@/constants/statuses";
import { StatCard } from "./StatCard";

export function PageStats({
  page,
  stats = {},
  rows = [],
  allRows = [],
  catalog = {},
  onNavigate,
  query = "",
  setQuery,
  activeFilter,
  onStockFilterChange,
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
  } else if (page === "Returns & Exchanges") {
    const requests = allRows.length ? allRows : rows;
    const pending = requests.filter((request) => request.status === RETURN_EXCHANGE_STATUSES[0]).length;
    const approved = requests.filter((request) => request.status === RETURN_EXCHANGE_STATUSES[1]).length;
    const completed = requests.filter((request) => request.status === RETURN_EXCHANGE_STATUSES[3]).length;

    cards = [
      {
        id: "returns_all",
        label: "All requests",
        value: requests.length,
        badge: "Return & exchange",
        sub: "Customer requests received",
        tone: "forest",
        icon: RotateCcw,
      },
      {
        id: "returns_pending",
        label: "Needs review",
        value: pending,
        badge: pending ? `${pending} pending` : "All clear",
        pulseAlert: pending > 0,
        sub: "Requests awaiting a decision",
        tone: "amber",
        icon: Clock3,
      },
      {
        id: "returns_approved",
        label: "Approved",
        value: approved,
        badge: "Ready to resolve",
        sub: "Requests approved by your team",
        tone: "gold",
        icon: Check,
      },
      {
        id: "returns_completed",
        label: "Completed",
        value: completed,
        badge: "Resolved",
        sub: "Requests fully processed",
        tone: "blue",
        icon: PackageCheck,
      },
    ];
  } else if (page === "Low Stock") {
    const outOfStockCount = targetRows.filter(
      (item) => Number(item.stockQty ?? 0) === 0,
    ).length;
    const criticalCount = targetRows.filter((item) => {
      const quantity = Number(item.stockQty ?? 0);
      return quantity > 0 && quantity <= 4;
    }).length;
    const warningCount = targetRows.filter((item) => {
      const quantity = Number(item.stockQty ?? 0);
      return quantity >= 5 && quantity < 10;
    }).length;

    cards = [
      {
        id: "low-stock-all",
        label: "Total low stock",
        value: targetRows.length,
        badge: "All items",
        sub: "Items below their stock threshold",
        tone: "forest",
        icon: Package,
        active: activeFilter === "all",
        onClick: onStockFilterChange ? () => onStockFilterChange("all") : undefined,
        hint: "Show all",
      },
      {
        id: "low-stock-out",
        label: "Out of stock",
        value: outOfStockCount,
        badge: outOfStockCount ? `${outOfStockCount} alerts` : "Clear",
        pulseAlert: outOfStockCount > 0,
        sub: "0 units remaining",
        tone: "amber",
        icon: AlertTriangle,
        active: activeFilter === "out",
        onClick: onStockFilterChange ? () => onStockFilterChange("out") : undefined,
        hint: "Filter",
      },
      {
        id: "low-stock-critical",
        label: "Critical stock",
        value: criticalCount,
        badge: criticalCount ? `${criticalCount} urgent` : "Clear",
        pulseAlert: criticalCount > 0,
        sub: "1 to 4 units left",
        tone: "gold",
        icon: AlertTriangle,
        active: activeFilter === "critical",
        onClick: onStockFilterChange ? () => onStockFilterChange("critical") : undefined,
        hint: "Filter",
      },
      {
        id: "low-stock-warning",
        label: "Warning level",
        value: warningCount,
        badge: warningCount ? `${warningCount} to monitor` : "Clear",
        sub: "5 to 9 units left",
        tone: "blue",
        icon: TrendingUp,
        active: activeFilter === "warning",
        onClick: onStockFilterChange ? () => onStockFilterChange("warning") : undefined,
        hint: "Filter",
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
