"use client";

import { Plus } from "lucide-react";
import { FormModal, SearchField } from "@/components/admin/global";
import { CategoryTable } from "@/components/admin/tables";
import { CategoryViewTabs, useCategoryView } from "@/components/admin/categories";

/**
 * Categories page: search, add button, categories/parent categories switch, the category
 * table and the category form.
 */
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
  const {
    categoryView,
    setCategoryView,
    isParentCategoryView,
    categoryCount,
    parentCategoryCount,
    visibleRows,
  } = useCategoryView(rows);
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

      <CategoryViewTabs
        isParentCategoryView={isParentCategoryView}
        categoryCount={categoryCount}
        parentCategoryCount={parentCategoryCount}
        onViewChange={setCategoryView}
      />

      <CategoryTable
        rows={visibleRows}
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
