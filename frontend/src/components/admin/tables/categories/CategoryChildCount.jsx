import { CountActionButton, CountBadge } from "../shared";

/**
 * Number of categories under a parent; opens the parent category details.
 * @param {{item: Object, count: number, onViewParent: (category: Object) => void}} props
 */
export function CategoryChildCount({ item, count, onViewParent }) {
  return (
    <CountActionButton
      title={`View ${count} ${count === 1 ? "category" : "categories"} under ${item.name}`}
      onActivate={() => onViewParent(item)}
    >
      <CountBadge count={count} unit={count === 1 ? "category" : "categories"} hasItems={Boolean(count)} />
    </CountActionButton>
  );
}
