"use client";

import { DashboardPanel } from "@/components/admin/dashboard";
import { FormModal, PageStats, SearchField } from "@/components/admin/global";
import { LowStockPanelActions, LowStockTable, useLowStock } from "@/components/admin/low-stock";

/**
 * Low Stock page: stock-band stats, the searchable restock table and the product form.
 */
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
  const {
    lowStockItems,
    displayedItems,
    stockFilter,
    setStockFilter,
    restockingId,
    customStockInputs,
    setCustomStockInput,
    quickRestock,
    setExactStock,
  } = useLowStock({ rows, query, token, onRefresh });

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
        action={<LowStockPanelActions onNavigate={onNavigate} onRefresh={onRefresh} />}
      >
        <div className="page-tools low-stock-tools">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search low stock products by title, SKU, category…"
          />
        </div>

        <LowStockTable
          items={displayedItems}
          query={query}
          restockingId={restockingId}
          customStockInputs={customStockInputs}
          onCustomStockChange={setCustomStockInput}
          onQuickRestock={quickRestock}
          onSetExactStock={setExactStock}
          onEdit={(product) => setForm({ kind: "products", item: product })}
          onToggleActive={onToggleActive}
          onDelete={(product) => remove("products", product)}
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
