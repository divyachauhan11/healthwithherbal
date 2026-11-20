import { parseProductBadges } from "./product-utils";

/**
 * First product badge as a tag ("new" badges in teal) plus "+N" for the rest.
 * Shows a dash when the product has no badge.
 * @param {{badge?: string}} props Comma separated badges.
 */
export function ProductBadgeCell({ badge }) {
  if (!badge) return <span style={{ color: "#9ca3af" }}>—</span>;
  const badges = parseProductBadges(badge);
  if (!badges.length) return <span style={{ color: "#9ca3af" }}>—</span>;

  const firstBadge = badges[0];
  const isNew = firstBadge.toLowerCase().includes("new");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }} title={badges.join(", ")}>
      <span
        className={`badge-tag ${isNew ? "badge-new" : ""}`}
        style={{
          display: "inline-block",
          maxWidth: "150px",
          overflow: "hidden",
          padding: "3px 8px",
          borderRadius: "5px",
          fontSize: "10px",
          fontWeight: 700,
          textOverflow: "ellipsis",
          textTransform: "uppercase",
          background: isNew ? "#ecfeff" : "#fef3c7",
          color: isNew ? "#0e7490" : "#92400e",
          border: isNew ? "1px solid #a5f3fc" : "1px solid #fde68a",
        }}
      >
        {firstBadge}
      </span>
      {badges.length > 1 && (
        <small style={{ color: "#69766f", fontSize: "11px", fontWeight: 600 }}>
          +{badges.length - 1}
        </small>
      )}
    </div>
  );
}
