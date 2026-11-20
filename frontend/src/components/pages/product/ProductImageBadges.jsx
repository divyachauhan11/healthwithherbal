"use client";

/**
 * Badges over the main product image ("Natural care" when there are none).
 * @param {{badges: string[]}} props
 */
export function ProductImageBadges({ badges }) {
  return (
    <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "6px", flexWrap: "wrap", zIndex: 2 }}>
      {badges.length > 0 ? (
        badges.map((b, idx) => (
          <span key={idx} className="product-badge" style={{ position: "static" }}>
            {b}
          </span>
        ))
      ) : (
        <span className="product-badge" style={{ position: "static" }}>
          Natural care
        </span>
      )}
    </div>
  );
}
