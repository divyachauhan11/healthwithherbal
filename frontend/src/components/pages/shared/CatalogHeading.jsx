"use client";

/**
 * Catalogue page heading (`.shop-heading`): eyebrow, title, copy and a count.
 * @param {object} props
 * @param {string} props.eyebrow
 * @param {string} props.title
 * @param {string} props.copy
 * @param {React.ReactNode} props.children Count label, e.g. `{n} products`.
 */
export function CatalogHeading({ eyebrow, title, copy, children }) {
  return (
    <div className="shop-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      <div className="shop-count">{children}</div>
    </div>
  );
}
