import { CountActionButton, ProductCountBadge, getRecordProductCount } from "../shared";

/**
 * Product count of a category; links to the matching products when there are
 * any (parent categories only link from the parent view).
 * @param {{item: Object, isParentCategoryView: boolean, onNavigate?: Function}} props
 */
export function CategoryProductCount({ item, isParentCategoryView, onNavigate }) {
  const count = getRecordProductCount(item);
  const canNavigate = Boolean(onNavigate && count > 0 && (!item.isParent || isParentCategoryView));
  const badge = <ProductCountBadge count={count} />;
  if (!canNavigate) return badge;

  return (
    <CountActionButton
      title={`View ${count} product${count > 1 ? "s" : ""} for ${item.name}`}
      onActivate={() => {
        if (item.isParent) {
          onNavigate("Products", {
            parentCategoryId: String(item._id),
            parentCategoryName: item.name,
          });
        } else {
          onNavigate("Products", item.name);
        }
      }}
    >
      {badge}
    </CountActionButton>
  );
}
