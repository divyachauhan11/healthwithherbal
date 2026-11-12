"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { SearchField, FormModal } from "../../../../components/admin/global";
import { CollectionTable } from "../../../../components/admin/custom";

export default function CollectionPage({
  page,
  rows,
  catalog,
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
  const [categoryView, setCategoryView] = useState("categories");
  const isParentCategoryView = kind === "categories" && categoryView === "parents";
  const entity = kind === "categories"
    ? (form?.parentCategory ? "parent-category" : "category")
    : "brand";
  const visibleRows = kind === "categories"
    ? rows.filter((item) => Boolean(item.isParent) === isParentCategoryView)
    : rows;
  const categoryCount = kind === "categories" ? rows.filter((item) => !item.isParent).length : 0;
  const parentCategoryCount = kind === "categories" ? rows.filter((item) => item.isParent).length : 0;

  return (
    <section className={`panel page-panel${kind === "categories" ? " category-management-panel" : ""}`}>
      <div className={`page-tools${kind === "categories" ? " category-management-tools" : ""}`}>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder={isParentCategoryView ? "Search parent categories" : `Search ${kind}`}
        />
        <button
          className="primary"
          onClick={() => setForm({ kind, item: null, parentCategory: isParentCategoryView })}
        >
          <Plus size={16} /> Add {isParentCategoryView ? "parent category" : kind === "categories" ? "category" : page.slice(0, -1).toLowerCase()}
        </button>
      </div>

      {kind === "categories" && (
        <div className="category-admin-tabs" role="group" aria-label="Category management view">
          <button
            type="button"
            aria-pressed={!isParentCategoryView}
            className={!isParentCategoryView ? "active" : ""}
            onClick={() => setCategoryView("categories")}
          >
            <span>Categories</span><span className="category-tab-count">{categoryCount}</span>
          </button>
          <button
            type="button"
            aria-pressed={isParentCategoryView}
            className={isParentCategoryView ? "active" : ""}
            onClick={() => setCategoryView("parents")}
          >
            <span>Parent Categories</span><span className="category-tab-count">{parentCategoryCount}</span>
          </button>
        </div>
      )}

      <CollectionTable
        kind={page}
        rows={visibleRows}
        categoryView={categoryView}
        categoryRows={catalog?.categories || rows}
        onEdit={(item) => setForm({ kind, item, parentCategory: Boolean(item.isParent) })}
        onDelete={(item) => remove(kind, item)}
        onNavigate={onNavigate}
      />

      <FormModal
        entity={entity}
        isOpen={Boolean(form?.kind === kind)}
        initial={form?.item}
        categories={catalog?.categories || rows}
        onSave={save}
        onClose={() => setForm(null)}
        busy={busy}
      />
    </section>
  );
}


