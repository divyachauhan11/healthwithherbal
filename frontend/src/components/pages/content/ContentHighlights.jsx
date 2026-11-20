/**
 * Row of numbered highlight tiles (title + detail), e.g. the policy reminders.
 * @param {object} props
 * @param {string} props.className Container class.
 * @param {string} props.label Accessible label of the row.
 * @param {Array<[string, string]>} props.items `[title, detail]` pairs.
 */
export function ContentHighlights({ className, label, items }) {
  return (
    <div className={className} aria-label={label}>
      {items.map(([title, detail], index) => (
        <div key={title}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{title}</strong>
          <small>{detail}</small>
        </div>
      ))}
    </div>
  );
}
