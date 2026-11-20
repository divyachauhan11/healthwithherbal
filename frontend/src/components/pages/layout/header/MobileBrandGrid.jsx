"use client";

/**
 * Brand pills listed inside the mobile menu's "Brand" section.
 * @param {object} props
 * @param {string[]} props.brands Brand names.
 * @param {(brand: string) => void} props.onSelect
 */
export function MobileBrandGrid({ brands, onSelect }) {
  return (
    <div className="mobile-brands-subgrid">
      {brands.map((brand) => (
        <button
          type="button"
          key={brand}
          className="mobile-brand-pill"
          onClick={() => onSelect(brand)}
        >
          {brand}
        </button>
      ))}
    </div>
  );
}
