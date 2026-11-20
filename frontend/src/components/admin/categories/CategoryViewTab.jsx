/**
 * Toggle button of the categories / parent categories view switch.
 * @param {{active: boolean, label: string, count: number, onSelect: () => void}} props
 */
export function CategoryViewTab({ active, label, count, onSelect }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={active ? "active" : ""}
      onClick={onSelect}
    >
      <span>{label}</span>
      <span className="category-tab-count">{count}</span>
    </button>
  );
}
