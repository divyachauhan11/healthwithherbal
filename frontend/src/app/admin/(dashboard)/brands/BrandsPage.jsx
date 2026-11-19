"use client";

import { Plus } from "lucide-react";
import { FormModal, SearchField } from "@/components/admin/global";
import { BrandTable } from "@/components/admin/tables";

export default function BrandsPage({
  rows = [],
  query,
  setQuery,
  form,
  setForm,
  save,
  remove,
  busy,
  onNavigate,
}) {
  return (
    <section className="panel page-panel">
      <div className="page-tools">
        <SearchField value={query} onChange={setQuery} placeholder="Search brands" />
        <button
          type="button"
          className="primary"
          onClick={() => setForm({ kind: "brands", item: null })}
        >
          <Plus size={16} /> Add brand
        </button>
      </div>

      <BrandTable
        rows={rows}
        onEdit={(item) => setForm({ kind: "brands", item })}
        onDelete={(item) => remove("brands", item)}
        onNavigate={onNavigate}
      />

      <FormModal
        entity="brand"
        isOpen={Boolean(form?.kind === "brands")}
        initial={form?.item}
        onSave={save}
        onClose={() => setForm(null)}
        busy={busy}
      />
    </section>
  );
}
