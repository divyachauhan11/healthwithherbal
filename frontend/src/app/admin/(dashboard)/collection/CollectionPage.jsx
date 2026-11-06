import { Plus } from "lucide-react";
import { SearchField, FormModal } from "../../../../components/admin/global";
import { CollectionTable } from "../../../../components/admin/custom";

export default function CollectionPage({
  page,
  rows,
  query,
  setQuery,
  form,
  setForm,
  save,
  remove,
  busy,
  onNavigate,
}) {
  const kind = page.toLowerCase();
  const entity = kind === "categories" ? "category" : "brand";

  return (
    <section className="panel page-panel">
      <div className="page-tools">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder={`Search ${kind}`}
        />
        <button
          className="primary"
          onClick={() => setForm({ kind, item: null })}
        >
          <Plus size={16} /> Add {page.slice(0, -1).toLowerCase()}
        </button>
      </div>

      <CollectionTable
        kind={page}
        rows={rows}
        onEdit={(item) => setForm({ kind, item })}
        onDelete={(item) => remove(kind, item)}
        onNavigate={onNavigate}
      />

      <FormModal
        entity={entity}
        isOpen={Boolean(form?.kind === kind)}
        initial={form?.item}
        categories={rows}
        onSave={save}
        onClose={() => setForm(null)}
        busy={busy}
      />
    </section>
  );
}


