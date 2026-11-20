"use client";

/**
 * Checkbox row in a shop filter group, with the matching product count.
 * @param {object} props
 * @param {string} props.label
 * @param {number} props.count Matching products; hidden when zero.
 * @param {boolean} props.checked
 * @param {() => void} props.onChange
 */
export function FilterOption({ label, count, checked, onChange }) {
  return (
    <label className="checkline">
      <div className="checkline-label">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
        />
        <span>{label}</span>
      </div>
      {count > 0 && <span className="filter-count">({count})</span>}
    </label>
  );
}
