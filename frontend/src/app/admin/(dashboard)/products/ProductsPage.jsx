import { Plus } from "lucide-react";
import { SearchField, ProductModal } from "../../../../components/admin/global";
import { ProductTable } from "../../../../components/admin/custom";

export default function ProductsPage({
  rows,
  query,
  setQuery,
  form,
  setForm,
  catalog,
  save,
  remove,
  onToggleActive,
  busy,
}) {
  return (
    <section className="panel page-panel">
      <div className="page-tools">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search products or SKU"
        />
        <button
          className="primary"
          onClick={() => setForm({ kind: "products", item: null })}
        >
          <Plus size={16} /> Add new product
        </button>
      </div>

      <ProductTable
        rows={rows}
        onEdit={(item) => setForm({ kind: "products", item })}
        onDelete={(item) => remove("products", item)}
        onToggleStatus={onToggleActive}
      />

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
