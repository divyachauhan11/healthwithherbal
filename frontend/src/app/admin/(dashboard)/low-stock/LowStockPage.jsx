"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Loader2, Plus, RefreshCw } from "lucide-react";
import { adminRequest } from "@/lib/admin-api";
import { DashboardPanel } from "@/components/admin/dashboard";
import {
  FormModal,
  PageStats,
  SearchField,
  currency,
} from "@/components/admin/global";
import { DataTable, RowActionsMenu } from "@/components/admin/tables";

function getStockCategory(product) {
  const quantity = Number(product.stockQty ?? 0);
  if (quantity === 0) return "out";
  if (quantity <= 4) return "critical";
  if (quantity < 10) return "warning";
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
  const [stockFilter, setStockFilter] = useState("all");
  const [restockingId, setRestockingId] = useState(null);
  const [customStockInputs, setCustomStockInputs] = useState({});

  const lowStockItems = useMemo(
    () =>
      (rows || []).filter((product) => {
        const quantity = Number(product.stockQty ?? 0);
        const threshold =
          product.lowStockThreshold !== undefined &&
          product.lowStockThreshold !== null
            ? Number(product.lowStockThreshold)
            : 10;
        return quantity <= threshold;
      }),
    [rows],
  );

  const displayedItems = useMemo(() => {
    let products = lowStockItems;
    if (stockFilter !== "all") {
      products = products.filter(
        (product) => getStockCategory(product) === stockFilter,
      );
    }

    const search = query.trim().toLowerCase();
    if (!search) return products;
    return products.filter(
      (product) =>
        product.title?.toLowerCase().includes(search) ||
        product.sku?.toLowerCase().includes(search) ||
        product.category?.toLowerCase().includes(search) ||
        product.brand?.toLowerCase().includes(search),
    );
  }, [lowStockItems, stockFilter, query]);

  const updateStockQuantity = async ({ productId, quantity, reason, onSuccess }) => {
    setRestockingId(productId);
    try {
      await adminRequest(`/products/${productId}/stock`, {
        method: "PATCH",
        token,
        body: { stockQty: quantity, reason },
      });
      onSuccess?.();
      onRefresh?.();
    } catch (error) {
      alert(error.message || "Failed to update stock");
    } finally {
      setRestockingId(null);
    }
  };

  const handleQuickRestock = async (productId, addAmount) => {
    const product = lowStockItems.find((item) => item._id === productId);
    if (!product || !token) return;

    await updateStockQuantity({
      productId,
      quantity: Number(product.stockQty ?? 0) + addAmount,
      reason: `Quick restock (+${addAmount})`,
    });
  };

  const handleSetExactStock = async (productId) => {
    const quantity = Number(customStockInputs[productId]);
    if (!Number.isFinite(quantity) || quantity < 0) {
      alert("Please enter a valid stock quantity (0 or greater).");
      return;
    }

    await updateStockQuantity({
      productId,
      quantity,
      reason: "Manual stock adjustment",
      onSuccess: () =>
        setCustomStockInputs((current) => ({ ...current, [productId]: "" })),
    });
  };

  return (
    <section className="low-stock-page">
      <PageStats
        page="Low Stock"
        rows={lowStockItems}
        activeFilter={stockFilter}
        onStockFilterChange={setStockFilter}
      />

      <DashboardPanel
        title="Products needing restock"
        description="Review stock levels and update inventory directly from the table."
        className="low-stock-panel"
        action={(
          <div className="low-stock-panel-actions">
            <button
              type="button"
              className="text-button"
              onClick={() => onNavigate?.("Dashboard")}
            >
              <ArrowLeft size={15} /> Dashboard
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => onRefresh?.()}
              title="Refresh list"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        )}
      >
        <div className="page-tools">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search low stock products by title, SKU, category…"
          />
          <button
            type="button"
            className="primary"
            onClick={() => setForm({ kind: "products", item: null })}
          >
            <Plus size={16} /> Add new product
          </button>
        </div>

        <DataTable
          data={displayedItems}
          rowKey="_id"
          pageSize={10}
          pageSizeOptions={[10, 25, 50]}
          emptyMessage={query
            ? "No low stock products match your search query."
            : "No products currently below this stock threshold."}
          columns={[
            {
              key: "title",
              label: "Product",
              sortable: true,
              render: (product) => (
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
                    <small className="cell-subtitle">{product.brand}</small>
                  </div>
                </div>
              ),
            },
            { key: "sku", label: "SKU", sortable: true, cellClassName: "muted" },
            { key: "category", label: "Category", sortable: true },
            {
              key: "stockQty",
              label: "Current Stock",
              sortable: true,
              render: (product) => {
                const quantity = Number(product.stockQty ?? 0);
                const tone = quantity === 0
                  ? { background: "#fee2e2", color: "#991b1b" }
                  : quantity <= 4
                    ? { background: "#ffedd5", color: "#9a3412" }
                    : { background: "#fef3c7", color: "#92400e" };
                const label = quantity === 0
                  ? "OUT"
                  : quantity <= 4
                    ? "CRITICAL"
                    : "LOW";

                return (
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "3px 8px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: "700",
                    ...tone,
                  }}>
                    {label} ({quantity}{quantity > 0 ? " left" : ""})
                  </span>
                );
              },
            },
            {
              key: "price",
              label: "Price",
              sortable: true,
              render: (product) => <b>{currency(product.price)}</b>,
            },
            {
              key: "quickRestock",
              label: "Quick Restock",
              width: "210px",
              render: (product) => {
                const isRestocking = restockingId === product._id;
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {[10, 25].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        className="outline"
                        disabled={isRestocking}
                        onClick={() => handleQuickRestock(product._id, amount)}
                        style={{ padding: "4px 8px", fontSize: "10.5px", fontWeight: "600" }}
                        title={`Add ${amount} units`}
                      >
                        +{amount}
                      </button>
                    ))}
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <input
                        type="number"
                        min="0"
                        placeholder="Set"
                        value={customStockInputs[product._id] ?? ""}
                        onChange={(event) =>
                          setCustomStockInputs((current) => ({
                            ...current,
                            [product._id]: event.target.value,
                          }))
                        }
                        style={{ width: "50px", height: "26px", padding: "0 6px", fontSize: "11px", border: "1px solid #d1d5db", borderRadius: "4px" }}
                        aria-label={`Set stock quantity for ${product.title}`}
                      />
                      <button
                        type="button"
                        className="primary"
                        disabled={
                          isRestocking ||
                          customStockInputs[product._id] === undefined ||
                          customStockInputs[product._id] === ""
                        }
                        onClick={() => handleSetExactStock(product._id)}
                        style={{ padding: "4px 8px", fontSize: "10px" }}
                      >
                        {isRestocking ? (
                          <Loader2 size={12} className="spin-animate" />
                        ) : "Set"}
                      </button>
                    </div>
                  </div>
                );
              },
            },
            {
              key: "actions",
              label: "Actions",
              render: (product) => (
                <RowActionsMenu
                  onEdit={() => setForm({ kind: "products", item: product })}
                  onHide={onToggleActive ? () => onToggleActive(product) : undefined}
                  hideLabel={product.active === false ? "Unhide product" : "Hide product"}
                  hideIcon={product.active === false ? Eye : EyeOff}
                  hideVariant={product.active === false ? "success" : "warning"}
                  onDelete={() => remove("products", product)}
                  editLabel="Edit"
                  deleteLabel="Delete"
                />
              ),
            },
          ]}
        />
      </DashboardPanel>

      <FormModal
        entity="product"
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
