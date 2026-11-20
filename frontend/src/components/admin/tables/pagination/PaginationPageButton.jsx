/**
 * A numbered page button; the current page is highlighted.
 * @param {{pageNumber: number, isCurrent: boolean, onSelect: (page: number) => void}} props
 */
export function PaginationPageButton({ pageNumber: p, isCurrent, onSelect }) {
  return (
    <button
      type="button"
      className={`pagination-btn ${isCurrent ? "current active" : ""}`}
      onClick={() => onSelect(p)}
      aria-label={`Page ${p}`}
      aria-current={isCurrent ? "page" : undefined}
    >
      {p}
    </button>
  );
}
