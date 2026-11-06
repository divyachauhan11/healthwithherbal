import { Plus } from "lucide-react";
import { SearchField, FormModal } from "../../../../components/admin/global";
import { BlogTable } from "../../../../components/admin/custom";

export default function BlogsPage({
  rows,
  query,
  setQuery,
  form,
  setForm,
  save,
  busy,
  remove,
}) {
  return (
    <section className="panel page-panel">
      <div className="page-tools">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search blog posts"
        />
        <button
          className="primary"
          onClick={() => setForm({ kind: "blogs", item: null })}
        >
          <Plus size={16} /> Add blog post
        </button>
      </div>

      <BlogTable
        rows={rows}
        onEdit={(item) => setForm({ kind: "blogs", item })}
        onDelete={remove ? (item) => remove("blogs", item) : undefined}
      />

      <FormModal
        entity="blog"
        isOpen={Boolean(form?.kind === "blogs")}
        initial={form?.item}
        onSave={save}
        onClose={() => setForm(null)}
        busy={busy}
      />
    </section>
  );
}

