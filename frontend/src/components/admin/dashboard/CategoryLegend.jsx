import { CategoryLegendItem } from "./CategoryLegendItem";

/**
 * Legend of the category donut, or a "No sales data yet" row.
 * @param {{items: Array<Object>}} props
 */
export function CategoryLegend({ items }) {
  return (
    <div className="legend">
      {items.map((item) => (
        <CategoryLegendItem key={item.name} item={item} />
      ))}
      {!items.length && (
        <div
          className="legend-item"
          style={{ gridTemplateColumns: "1fr", color: "#8a948f" }}
        >
          <span>No sales data yet</span>
        </div>
      )}
    </div>
  );
}
