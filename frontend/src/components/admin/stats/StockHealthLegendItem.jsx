/**
 * Legend entry of the stock health bar: colour dot, label and count.
 * @param {{color: string, label: string, count: number}} props `label` includes its trailing ": ".
 */
export function StockHealthLegendItem({ color, label, count }) {
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
      }}
    >
      <i
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: color,
          display: "inline-block",
        }}
      />
      {label}<b>{count}</b>
    </span>
  );
}
