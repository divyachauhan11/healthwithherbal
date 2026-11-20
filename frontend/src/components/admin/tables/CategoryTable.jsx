"use client";

import { DataTable } from "./DataTable";
import { ParentCategoryModal, useCategoryTable } from "./categories";

/**
 * Categories table (normal or parent-category view) with the parent category
 * details dialog.
 * @param {Object} props
 * @param {Array<Object>} [props.rows=[]] Rows to list.
 * @param {"categories"|"parents"} [props.categoryView="categories"]
 * @param {Array<Object>} [props.categoryRows=rows] All categories (to group children under parents).
 * @param {(category: Object) => void} props.onEdit
 * @param {(category: Object) => void} props.onDelete
 * @param {Function} [props.onNavigate] Admin navigation (page, filter).
 * @param {number} [props.pageSize=10] Initial rows per page.
 */
export function CategoryTable({
  rows = [],
  categoryView = "categories",
  categoryRows = rows,
  onEdit,
  onDelete,
  onNavigate,
  pageSize = 10,
}) {
  const {
    columns,
    isParentCategoryView,
    viewedParentCategory,
    viewedSubcategories,
    viewedProductCount,
    closeParentDetails,
  } = useCategoryTable({ categoryView, categoryRows, onEdit, onDelete, onNavigate });

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        pageSize={pageSize}
        emptyMessage={isParentCategoryView ? "No parent categories found." : "No categories found."}
      />
      <ParentCategoryModal
        category={viewedParentCategory}
        subcategories={viewedSubcategories}
        productCount={viewedProductCount}
        onClose={closeParentDetails}
      />
    </>
  );
}
