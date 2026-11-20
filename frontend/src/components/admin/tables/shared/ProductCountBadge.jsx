import { CountBadge } from "./CountBadge";

/**
 * Count badge for the number of products in a category or brand.
 * @param {{count: number}} props
 */
export function ProductCountBadge({ count }) {
  return <CountBadge count={count} unit={count === 1 ? "item" : "items"} hasItems={count > 0} />;
}
