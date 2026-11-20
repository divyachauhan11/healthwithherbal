/**
 * Donut chart of category shares with the period total in the middle.
 * @param {{gradient: string, total: string}} props
 */
export function CategoryDonut({ gradient, total }) {
  return (
    <div className="donut" style={{ background: gradient }}>
      <div className="donut-center">
        <strong
          className="donut-number"
          style={{
            fontFamily:
              "'DM Sans', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontVariantNumeric: "tabular-nums",
            fontWeight: 700,
            letterSpacing: "-0.5px",
          }}
        >
          {total}
        </strong>
        <span>Total</span>
      </div>
    </div>
  );
}
