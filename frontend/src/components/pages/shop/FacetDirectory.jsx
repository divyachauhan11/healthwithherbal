"use client";

/**
 * Row of facet pills (brands or concerns) above the shop results.
 * @param {object} props
 * @param {string} props.className Container class ("brand-directory ...").
 * @param {string[]} props.options
 * @param {string} props.selected Selected facet.
 * @param {(option: string) => void} props.onSelect
 */
export function FacetDirectory({ className, options, selected, onSelect }) {
  return (
    <div className={className}>
      {options.map((option) => (
        <button
          type="button"
          className={selected === option ? "active" : ""}
          key={option}
          onClick={() => onSelect(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
