/**
 * Pill showing a count and its unit, e.g. "4 items".
 * @param {{count: number, unit: string, hasItems: boolean}} props
 */
export function CountBadge({ count, unit, hasItems }) {
  return (
    <span className={`category-count-badge ${hasItems ? "has-items" : "empty"}`}>
      <b>{count}</b> <small>{unit}</small>
    </span>
  );
}
