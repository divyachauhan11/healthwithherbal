"use client";

/**
 * Brand buttons of the "Shop by brand" mega menu.
 * @param {object} props
 * @param {string[]} props.brands Brand names.
 * @param {() => void} props.onHover Keeps the brand menu open.
 * @param {(brand: string) => void} props.onSelect
 */
export function MegaMenuBrandLinks({ brands, onHover, onSelect }) {
  return brands.map((brand) => (
    <button
      type="button"
      key={brand}
      onMouseEnter={onHover}
      onClick={() => onSelect(brand)}
    >
      {brand}
    </button>
  ));
}
