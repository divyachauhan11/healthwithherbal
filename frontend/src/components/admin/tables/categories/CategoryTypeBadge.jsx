import { HeartPulse, Pill } from "lucide-react";

/**
 * Category section label: parent category, health concern or product form.
 * @param {{item: Object}} props
 */
export function CategoryTypeBadge({ item }) {
  if (item.isParent) return <span className="category-parent-badge">Parent category</span>;
  const isConcern = item.type === "concern";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 9px",
        borderRadius: "12px",
        fontSize: "0.75rem",
        fontWeight: 600,
        background: isConcern ? "#fef3c7" : "#ecfdf5",
        color: isConcern ? "#92400e" : "#065f46",
        border: `1px solid ${isConcern ? "#fde68a" : "#a7f3d0"}`,
      }}
    >
      {isConcern ? <HeartPulse size={12} /> : <Pill size={12} />}
      {isConcern ? "Health Concern" : "Product Form"}
    </span>
  );
}
