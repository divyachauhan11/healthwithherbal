"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { FormModal, SearchField } from "@/components/admin/global";
import { CategoryTable } from "@/components/admin/tables";

export default function CategoriesPage({
  rows = [],
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
  const [categoryView, setCategoryView] = useState("categories");
  const isParentCategoryView = categoryView === "parents";
  const categoryCount = rows.filter((item) => !item.isParent).length;
  const parentCategoryCount = rows.filter((item) => item.isParent).length;
  const categoryRows = catalog?.categories || rows;

  return (
    <section className="panel page-panel category-management-panel">
      <div className="page-tools category-management-tools">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder={isParentCategoryView ? "Search parent categories" : "Search categories"}
        />
        <button
          type="button"
          className="primary"
          onClick={() => setForm({ kind: "categories", item: null, parentCategory: isParentCategoryView })}
        >
          <Plus size={16} /> Add {isParentCategoryView ? "parent category" : "category"}
        </button>
      </div>

      <div className="category-admin-tabs" role="group" aria-label="Category management view">
        <button
          type="button"
          aria-pressed={!isParentCategoryView}
          className={!isParentCategoryView ? "active" : ""}
          onClick={() => setCategoryView("categories")}
        >
          <span>Categories</span>
          <span className="category-tab-count">{categoryCount}</span>
        </button>
        <button
          type="button"
          aria-pressed={isParentCategoryView}
          className={isParentCategoryView ? "active" : ""}
          onClick={() => setCategoryView("parents")}
        >
          <span>Parent Categories</span>
          <span className="category-tab-count">{parentCategoryCount}</span>
        </button>
      </div>

      <CategoryTable
        rows={rows.filter((item) => Boolean(item.isParent) === isParentCategoryView)}
        categoryView={categoryView}
        categoryRows={categoryRows}
        onEdit={(item) => setForm({ kind: "categories", item, parentCategory: Boolean(item.isParent) })}
        onDelete={(item) => remove("categories", item)}
        onNavigate={onNavigate}
      />

      <FormModal
        entity={form?.parentCategory ? "parent-category" : "category"}
        isOpen={Boolean(form?.kind === "categories")}
        initial={form?.item}
        categories={categoryRows}
        onSave={save}
        onClose={() => setForm(null)}
        busy={busy}
      />
    </section>
  );
}
