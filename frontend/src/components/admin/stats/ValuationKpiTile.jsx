/**
 * One headline figure of the inventory valuation breakdown.
 * @param {{label: string, value: React.ReactNode, color: string}} props
 */
export function ValuationKpiTile({ label, value, color }) {
  return (
    <div
      style={{
        background: "#faf8f4",
        border: "1px solid #e7dfd4",
        borderRadius: "10px",
        padding: "12px",
      }}
    >
      <small
        style={{
          color: "#77837d",
          fontSize: "11px",
          fontWeight: "600",
          textTransform: "uppercase",
        }}
      >
        {label}
      </small>
      <div
        style={{
          fontSize: "20px",
          fontWeight: "700",
          color,
          marginTop: "4px",
        }}
      >
        {value}
      </div>
    </div>
  );
}
