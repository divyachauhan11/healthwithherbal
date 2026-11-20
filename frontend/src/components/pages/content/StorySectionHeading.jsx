/**
 * Eyebrow, title and lead copy heading of an Our Story section.
 * @param {object} props
 * @param {string} props.eyebrow
 * @param {string} props.title
 * @param {string} props.copy
 */
export function StorySectionHeading({ eyebrow, title, copy }) {
  return (
    <header className="story-section-heading">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{copy}</p>
    </header>
  );
}
