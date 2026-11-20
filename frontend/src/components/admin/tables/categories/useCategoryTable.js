import { useMemo, useState } from "react";
import { getCategoryColumns } from "./category-columns";
import { getChildCategories, sumProductCounts } from "./category-utils";

/**
 * Owns the categories table state: which parent category is open in the
 * details dialog, its grouped categories and product total, and the columns.
 * @param {Object} options
 * @param {string} options.categoryView "categories" or "parents".
 * @param {Array<Object>} options.categoryRows All categories.
 * @param {(category: Object) => void} options.onEdit
 * @param {(category: Object) => void} options.onDelete
 * @param {Function} [options.onNavigate]
 * @returns {{columns: Array<Object>, isParentCategoryView: boolean, viewedParentCategory: Object|null, viewedSubcategories: Array<Object>, viewedProductCount: number, closeParentDetails: () => void}}
 */
export function useCategoryTable({ categoryView, categoryRows, onEdit, onDelete, onNavigate }) {
  const [viewedParentCategory, setViewedParentCategory] = useState(null);
  const isParentCategoryView = categoryView === "parents";
  const viewedSubcategories = viewedParentCategory
    ? getChildCategories(categoryRows, viewedParentCategory._id)
    : [];
  const viewedProductCount = sumProductCounts(viewedSubcategories);

  const columns = useMemo(
    () => getCategoryColumns({
      isParentCategoryView,
      categoryRows,
      onEdit,
      onDelete,
      onNavigate,
      onViewParent: setViewedParentCategory,
    }),
    [isParentCategoryView, categoryRows, onEdit, onDelete, onNavigate],
  );

  return {
    columns,
    isParentCategoryView,
    viewedParentCategory,
    viewedSubcategories,
    viewedProductCount,
    closeParentDetails: () => setViewedParentCategory(null),
  };
}
