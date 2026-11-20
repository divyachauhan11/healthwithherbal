/**
 * Checkbox card for one parent category in the homepage selection.
 * @param {{category: object, checked: boolean, limitReached: boolean, onToggle: () => void}} props
 *   Unchecked options are disabled once `limitReached`.
 */
export function FeaturedCategoryOption({ category, checked, limitReached, onToggle }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 15px", border: `1px solid ${checked ? "#a85a37" : "#e7e2dc"}`, borderRadius: 10, background: checked ? "#fbf3ed" : "#fff", cursor: checked || !limitReached ? "pointer" : "not-allowed", opacity: !checked && limitReached ? 0.6 : 1 }}>
      <input type="checkbox" checked={checked} onChange={onToggle} disabled={!checked && limitReached} />
      <span style={{ fontWeight: 650, color: "#402514" }}>{category.name}</span>
    </label>
  );
}
