"use client";

/**
 * Stack of badge labels over a product card image.
 * @param {{badges: string[]}} props
 */
export function ProductCardBadges({ badges }) {
  return (
    <div
      className="product-badge-group"
      style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        zIndex: 2,
        alignItems: "flex-start",
      }}
    >
      {badges.map((b, idx) => (
        <span
          key={idx}
          className="product-badge"
          style={{ position: "static" }}
        >
          {b}
        </span>
      ))}
    </div>
  );
}
