"use client";

import { useState } from "react";

/**
 * Owns the categories page view switch ("categories" or "parents") and the rows and
 * counts for each view.
 * @param {Array<object>} rows Categories and parent categories (`isParent`).
 * @returns {{
 *   categoryView: "categories"|"parents", setCategoryView: Function, isParentCategoryView: boolean,
 *   categoryCount: number, parentCategoryCount: number, visibleRows: Array<object>
 * }}
 */
export function useCategoryView(rows) {
  const [categoryView, setCategoryView] = useState("categories");
  const isParentCategoryView = categoryView === "parents";
  const categoryCount = rows.filter((item) => !item.isParent).length;
  const parentCategoryCount = rows.filter((item) => item.isParent).length;
  const visibleRows = rows.filter((item) => Boolean(item.isParent) === isParentCategoryView);

  return {
    categoryView,
    setCategoryView,
    isParentCategoryView,
    categoryCount,
    parentCategoryCount,
    visibleRows,
  };
}
