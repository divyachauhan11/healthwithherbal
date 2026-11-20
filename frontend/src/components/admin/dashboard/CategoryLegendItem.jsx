import { formatCompactAmount, formatExactPct } from "./sales-by-category-utils";

/**
 * Legend row of the category donut: colour, name and share.
 * @param {{item: {name: string, color: string, rawPct: number, amount: number}}} props
 */
export function CategoryLegendItem({ item }) {
  return (
    <div
      className="legend-item"
      title={`${item.name}: ${formatExactPct(item.rawPct)} (${formatCompactAmount(item.amount)})`}
    >
      <i style={{ backgroundColor: item.color }} />
      <span className="legend-label">{item.name}</span>
      <b className="legend-pct">{formatExactPct(item.rawPct)}</b>
    </div>
  );
}
