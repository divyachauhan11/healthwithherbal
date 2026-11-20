import { CategoryViewTab } from "./CategoryViewTab";

/**
 * Switch between the categories and parent categories views, with their counts.
 * @param {{isParentCategoryView: boolean, categoryCount: number, parentCategoryCount: number, onViewChange: (view: string) => void}} props
 */
export function CategoryViewTabs({ isParentCategoryView, categoryCount, parentCategoryCount, onViewChange }) {
  return (
    <div className="category-admin-tabs" role="group" aria-label="Category management view">
      <CategoryViewTab
        active={!isParentCategoryView}
        label="Categories"
        count={categoryCount}
        onSelect={() => onViewChange("categories")}
      />
      <CategoryViewTab
        active={isParentCategoryView}
        label="Parent Categories"
        count={parentCategoryCount}
        onSelect={() => onViewChange("parents")}
      />
    </div>
  );
}
