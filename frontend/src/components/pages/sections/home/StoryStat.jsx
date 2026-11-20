"use client";

/**
 * Headline figure in the brand story section.
 * @param {{value: string, label: string}} props
 */
export function StoryStat({ value, label }) {
  return (
    <div className="story-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
