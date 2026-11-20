"use client";

/**
 * Section heading: eyebrow, title and optional copy.
 * @param {object} props
 * @param {string} props.eyebrow
 * @param {React.ReactNode} props.title
 * @param {string} [props.copy]
 * @param {boolean} [props.centered]
 */
export function SectionHeading({ eyebrow, title, copy, centered }) {
  return (
    <div className={`section-heading ${centered ? "centered" : ""}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  );
}
