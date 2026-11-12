"use client";

import { useState, useMemo } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronRight,
  Edit,
  Eye,
  EyeOff,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { SearchField, Empty, currency, ProductModal } from "../../../../components/admin/global";
import { RowActionsMenu, TablePagination, useTablePagination } from "../../../../components/admin/custom";
import { adminRequest } from "../../../../lib/admin-api";

function getStockCategory(product) {
  const quantity = product.stockQty ?? 0;
  if (quantity === 0) return "out";
  if (quantity >= 1 && quantity <= 4) return "critical";
  if (quantity >= 5 && quantity < 10) return "warning";
  return "healthy";
}

export default function LowStockPage({
  rows = [],
  query = "",
  setQuery,
  form,
  setForm,
  catalog,
  save,
  remove,
  onToggleActive,
  busy,
  token,
  onRefresh,
  onNavigate,
}) {
  const [stockFilter, setStockFilter] = useState("all"); // "all" | "out" | "critical" | "warning"
  const [restockingId, setRestockingId] = useState(null);
  const [customStockInputs, setCustomStockInputs] = useState({});

  // Ensure rows are products with stock <= custom lowStockThreshold (or <= 10)
  const lowStockItems = useMemo(() => {
    return (rows || []).filter((p) => {
      const qty = Number(p.stockQty ?? 0);
      const threshold =
        p.lowStockThreshold !== undefined && p.lowStockThreshold !== null
          ? Number(p.lowStockThreshold)
          : 10;
      return qty <= threshold;
    });
  }, [rows]);

  // Metric counts
  const outOfStockCount = useMemo(
    () =>
      lowStockItems.filter((product) => getStockCategory(product) === "out")
        .length,
    [lowStockItems]
  );
  const criticalCount = useMemo(
    () =>
      lowStockItems.filter(
        (product) => getStockCategory(product) === "critical"
      ).length,
    [lowStockItems]
  );
  const warningCount = useMemo(
    () =>
      lowStockItems.filter(
        (product) => getStockCategory(product) === "warning"
      ).length,
    [lowStockItems]
  );

  // Filtered rows by tab and search
  const displayedItems = useMemo(() => {
    let list = lowStockItems;
    if (stockFilter !== "all") {
      list = list.filter((product) => getStockCategory(product) === stockFilter);
    }
    const needle = query.trim().toLowerCase();
    if (!needle) return list;
    return list.filter(
      (p) =>
        p.title?.toLowerCase().includes(needle) ||
        p.sku?.toLowerCase().includes(needle) ||
        p.category?.toLowerCase().includes(needle) ||
        p.brand?.toLowerCase().includes(needle)
    );
  }, [lowStockItems, stockFilter, query]);

  const pagination = useTablePagination(displayedItems, 10);

  const updateStockQuantity = async ({
    productId,
    quantity,
    reason,
    onSuccess,
  }) => {
    setRestockingId(productId);
    try {
      await adminRequest(`/products/${productId}/stock`, {
        method: "PATCH",
        token,
        body: { stockQty: quantity, reason },
      });
      onSuccess?.();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || "Failed to update stock");
    } finally {
      setRestockingId(null);
    }
  };

  // Handle Quick Restock action
  const handleQuickRestock = async (productId, addAmount) => {
    const product = lowStockItems.find((p) => p._id === productId);
    if (!product || !token) return;
    const currentQty = product.stockQty ?? 0;
    const newQty = currentQty + addAmount;

    await updateStockQuantity({
      productId,
      quantity: newQty,
      reason: `Quick restock (+${addAmount})`,
    });
  };

  // Handle Custom Stock Input submission
  const handleSetExactStock = async (productId) => {
    const val = Number(customStockInputs[productId]);
    if (isNaN(val) || val < 0) {
      alert("Please enter a valid stock quantity (0 or greater).");
      return;
    }
    await updateStockQuantity({
      productId,
      quantity: val,
      reason: "Manual stock adjustment",
      onSuccess: () =>
        setCustomStockInputs((prev) => ({ ...prev, [productId]: "" })),
    });
  };

  return (
    <section className="panel page-panel low-stock-page">
      {/* Top Breadcrumb & Summary Strip */}
      <div
        style={{
          padding: "16px 20px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #ebe5dc",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <button
          type="button"
          className="text-button"
          onClick={() => onNavigate && onNavigate("Dashboard")}
          style={{ fontSize: "12.5px", fontWeight: "600", gap: "6px" }}
        >
          <ArrowLeft size={15} /> Back to Dashboard
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "12px",
              color: "#6b7280",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <AlertTriangle size={15} color="#d97706" />
            Showing products with less than 10 units in stock
          </span>
          <button
            type="button"
            className="text-button"
            onClick={() => onRefresh && onRefresh()}
            title="Refresh list"
            style={{ padding: "4px 8px" }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          padding: "16px 20px",
          background: "#faf7f2",
          borderBottom: "1px solid #ebe5dc",
        }}
      >
        <div
          onClick={() => setStockFilter("all")}
          style={{
            background: "#ffffff",
            padding: "14px 18px",
            borderRadius: "8px",
            border: `1.5px solid ${stockFilter === "all" ? "var(--forest, #3f6050)" : "#e8e2d8"}`,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
          }}
        >
          <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>
            Total Low Stock
          </span>
          <div style={{ fontSize: "22px", fontWeight: "700", color: "#24352f", marginTop: "4px" }}>
            {lowStockItems.length}
          </div>
          <small style={{ fontSize: "10.5px", color: "#8a948f" }}>All items &lt; 10</small>
        </div>

        <div
          onClick={() => setStockFilter("out")}
          style={{
            background: "#ffffff",
            padding: "14px 18px",
            borderRadius: "8px",
            border: `1.5px solid ${stockFilter === "out" ? "#dc2626" : "#e8e2d8"}`,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
          }}
        >
          <span style={{ fontSize: "11px", color: "#b91c1c", fontWeight: "600", textTransform: "uppercase" }}>
            Out of Stock
          </span>
          <div style={{ fontSize: "22px", fontWeight: "700", color: "#dc2626", marginTop: "4px" }}>
            {outOfStockCount}
          </div>
          <small style={{ fontSize: "10.5px", color: "#8a948f" }}>0 units remaining</small>
        </div>

        <div
          onClick={() => setStockFilter("critical")}
          style={{
            background: "#ffffff",
            padding: "14px 18px",
            borderRadius: "8px",
            border: `1.5px solid ${stockFilter === "critical" ? "#ea580c" : "#e8e2d8"}`,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
          }}
        >
          <span style={{ fontSize: "11px", color: "#c2410c", fontWeight: "600", textTransform: "uppercase" }}>
            Critical Stock
          </span>
          <div style={{ fontSize: "22px", fontWeight: "700", color: "#ea580c", marginTop: "4px" }}>
            {criticalCount}
          </div>
          <small style={{ fontSize: "10.5px", color: "#8a948f" }}>1 to 4 units left</small>
        </div>

        <div
          onClick={() => setStockFilter("warning")}
          style={{
            background: "#ffffff",
            padding: "14px 18px",
            borderRadius: "8px",
            border: `1.5px solid ${stockFilter === "warning" ? "#d97706" : "#e8e2d8"}`,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
          }}
        >
          <span style={{ fontSize: "11px", color: "#b45309", fontWeight: "600", textTransform: "uppercase" }}>
            Warning Level
          </span>
          <div style={{ fontSize: "22px", fontWeight: "700", color: "#d97706", marginTop: "4px" }}>
            {warningCount}
          </div>
          <small style={{ fontSize: "10.5px", color: "#8a948f" }}>5 to 9 units left</small>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="page-tools">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search low stock products by title, SKU, category…"
        />
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="primary"
            onClick={() => setForm({ kind: "products", item: null })}
          >
            <Plus size={16} /> Add new product
          </button>
        </div>
      </div>

      {/* Low Stock Products Table */}
      <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Price</th>
                <th style={{ minWidth: "210px" }}>Quick Restock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagination.displayedRows.map((product) => {
                const qty = product.stockQty ?? 0;
                const isRestocking = restockingId === product._id;

                return (
                  <tr key={product._id}>
                    <td>
                      <div className="product-cell">
                        <div
                          className="product-thumb"
                          style={{
                            background: "var(--forest, #3f6050)",
                            color: "#fff",
                            overflow: "hidden",
                            borderRadius: "6px",
                          }}
                        >
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.title}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            product.title?.slice(0, 1)
                          )}
                        </div>
                        <div>
                          <b>{product.title}</b>
                          <small className="cell-subtitle">
                            {product.brand}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td className="muted">{product.sku || "—"}</td>
                    <td>{product.category}</td>
                    <td>
                      {qty === 0 ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            background: "#fee2e2",
                            color: "#991b1b",
                            padding: "3px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: "700",
                          }}
                        >
                          OUT (0)
                        </span>
                      ) : qty <= 4 ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            background: "#ffedd5",
                            color: "#9a3412",
                            padding: "3px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: "700",
                          }}
                        >
                          CRITICAL ({qty} left)
                        </span>
                      ) : (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            background: "#fef3c7",
                            color: "#92400e",
                            padding: "3px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: "700",
                          }}
                        >
                          LOW ({qty} left)
                        </span>
                      )}
                    </td>
                    <td>
                      <b>{currency(product.price)}</b>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <button
                          type="button"
                          className="outline"
                          disabled={isRestocking}
                          onClick={() => handleQuickRestock(product._id, 10)}
                          style={{ padding: "4px 8px", fontSize: "10.5px", fontWeight: "600" }}
                          title="Add 10 units"
                        >
                          +10
                        </button>
                        <button
                          type="button"
                          className="outline"
                          disabled={isRestocking}
                          onClick={() => handleQuickRestock(product._id, 25)}
                          style={{ padding: "4px 8px", fontSize: "10.5px", fontWeight: "600" }}
                          title="Add 25 units"
                        >
                          +25
                        </button>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <input
                            type="number"
                            min="0"
                            placeholder="Set"
                            value={customStockInputs[product._id] ?? ""}
                            onChange={(e) =>
                              setCustomStockInputs({
                                ...customStockInputs,
                                [product._id]: e.target.value,
                              })
                            }
                            style={{
                              width: "50px",
                              height: "26px",
                              padding: "0 6px",
                              fontSize: "11px",
                              border: "1px solid #d1d5db",
                              borderRadius: "4px",
                            }}
                          />
                          <button
                            type="button"
                            className="primary"
                            disabled={isRestocking || customStockInputs[product._id] === undefined || customStockInputs[product._id] === ""}
                            onClick={() => handleSetExactStock(product._id)}
                            style={{ padding: "4px 8px", fontSize: "10px" }}
                          >
                            {isRestocking ? (
                              <Loader2 size={12} className="spin-animate" />
                            ) : (
                              "Set"
                            )}
                          </button>
                        </div>
                      </div>
                    </td>
                    <td>
                      <RowActionsMenu
                        onEdit={() => setForm({ kind: "products", item: product })}
                        onHide={
                          onToggleActive ? () => onToggleActive(product) : undefined
                        }
                        hideLabel={product.active === false ? "Unhide product" : "Hide product"}
                        hideIcon={product.active === false ? Eye : EyeOff}
                        hideVariant={product.active === false ? "success" : "warning"}
                        onDelete={() => remove("products", product)}
                        editLabel="Edit"
                        deleteLabel="Delete"
                      />
                    </td>
                  </tr>
                );
              })}
              {!displayedItems.length && (
                <tr>
                  <td colSpan="7">
                    <Empty>
                      {query
                        ? "No low stock products match your search query."
                        : "No products currently below this stock threshold."}
                    </Empty>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {displayedItems.length > 0 && (
          <TablePagination
            totalItems={pagination.totalItems}
            page={pagination.page}
            setPage={pagination.setPage}
            pageSize={pagination.pageSize}
            onPageSizeChange={pagination.setPageSize}
          />
        )}

      <ProductModal
        isOpen={Boolean(form?.kind === "products")}
        initial={form?.item}
        brands={catalog?.brands || []}
        categories={catalog?.categories || []}
        onSave={save}
        onClose={() => setForm(null)}
        busy={busy}
      />
    </section>
  );
}
