/**
 * One coloured part of the stock health bar, sized by its share of all SKUs.
 * @param {{count: number, total: number, color: string, title: string}} props
 */
export function StockHealthSegment({ count, total, color, title }) {
  return (
    <div
      style={{
        width: `${(count / (total || 1)) * 100}%`,
        background: color,
      }}
      title={title}
    />
  );
}
