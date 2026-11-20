import { RecordStatusBadge, compareRecordProductCounts } from "../shared";
import { CategoryChildCount } from "./CategoryChildCount";
import { CategoryNameCell } from "./CategoryNameCell";
import { CategoryProductCount } from "./CategoryProductCount";
import { CategoryRowActions } from "./CategoryRowActions";
import { CategoryTypeBadge } from "./CategoryTypeBadge";
import { countChildCategories } from "./category-utils";

/**
 * DataTable column definitions for the categories table (normal or parent view).
 * @param {Object} options
 * @param {boolean} options.isParentCategoryView Listing parent categories.
 * @param {Array<Object>} options.categoryRows All categories (to count children).
 * @param {(category: Object) => void} options.onEdit
 * @param {(category: Object) => void} options.onDelete
 * @param {Function} [options.onNavigate] Admin navigation (page, filter).
 * @param {(category: Object) => void} options.onViewParent Open parent category details.
 * @returns {Array<Object>}
 */
export function getCategoryColumns({
  isParentCategoryView,
  categoryRows,
  onEdit,
  onDelete,
  onNavigate,
  onViewParent,
}) {
  return [
    {
      key: "name",
      label: "Category",
      sortable: true,
      render: (item) => (
        <CategoryNameCell item={item} onViewParent={onViewParent} onNavigate={onNavigate} />
      ),
    },
    { key: "slug", label: "Slug", cellClassName: "muted", sortable: true },
    {
      key: "type",
      label: "Type / Section",
      sortable: true,
      render: (item) => <CategoryTypeBadge item={item} />,
    },
    {
      key: isParentCategoryView ? "categoryCount" : "parentId",
      label: isParentCategoryView ? "Category count" : "Parent category",
      sortable: true,
      sortFn: isParentCategoryView
        ? (a, b) =>
            countChildCategories(categoryRows, a._id) -
            countChildCategories(categoryRows, b._id)
        : undefined,
      render: (item) => {
        if (!isParentCategoryView) return item.isParent ? "—" : item.parentName || "—";
        return (
          <CategoryChildCount
            item={item}
            count={countChildCategories(categoryRows, item._id)}
            onViewParent={onViewParent}
          />
        );
      },
    },
    {
      key: "count",
      label: "Products",
      sortable: true,
      sortFn: compareRecordProductCounts,
      render: (item) => (
        <CategoryProductCount
          item={item}
          isParentCategoryView={isParentCategoryView}
          onNavigate={onNavigate}
        />
      ),
    },
    {
      key: "isActive",
      label: "Status",
      sortable: true,
      render: (item) => <RecordStatusBadge status={item.isActive === false ? "Hidden" : "Active"} />,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (item) => (
        <CategoryRowActions
          item={item}
          isParentCategoryView={isParentCategoryView}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewParent={onViewParent}
        />
      ),
    },
  ];
}
