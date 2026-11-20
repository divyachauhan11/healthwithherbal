import { dateLabel } from "../../global/admin-utils";
import { ParentCategoryStat } from "./ParentCategoryStat";

/**
 * Key facts of a parent category: slug, status, counts and dates.
 * @param {{category: Object, categoryCount: number, productCount: number}} props
 */
export function ParentCategoryOverview({ category, categoryCount, productCount }) {
  return (
    <div className="category-details-overview">
      <ParentCategoryStat label="URL slug">/{category.slug || "—"}</ParentCategoryStat>
      <ParentCategoryStat label="Status">{category.isActive === false ? "Inactive" : "Active"}</ParentCategoryStat>
      <ParentCategoryStat label="Categories">{categoryCount}</ParentCategoryStat>
      <ParentCategoryStat label="Products">{productCount}</ParentCategoryStat>
      <ParentCategoryStat label="Created">{category.createdAt ? dateLabel(category.createdAt) : "—"}</ParentCategoryStat>
      <ParentCategoryStat label="Last updated">{category.updatedAt ? dateLabel(category.updatedAt) : "—"}</ParentCategoryStat>
    </div>
  );
}
