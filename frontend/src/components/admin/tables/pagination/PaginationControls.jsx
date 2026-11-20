import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationPageButton } from "./PaginationPageButton";

/**
 * Previous/next buttons around the numbered page buttons and "…" gaps.
 * @param {{page: number, totalPages: number, pages: Array<number|"...">, setPage: (page: number) => void}} props
 */
export function PaginationControls({ page, totalPages, pages, setPage }) {
  return (
    <div className="pagination-controls">
      <button
        type="button"
        className="pagination-btn nav-btn"
        disabled={page <= 1}
        onClick={() => setPage(Math.max(1, page - 1))}
        aria-label="Previous page"
        title="Previous page"
      >
        <ChevronLeft size={15} />
      </button>

      {pages.map((p, idx) =>
        p === "..." ? (
          <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
            …
          </span>
        ) : (
          <PaginationPageButton
            key={`page-${p}`}
            pageNumber={p}
            isCurrent={page === p}
            onSelect={setPage}
          />
        ),
      )}

      <button
        type="button"
        className="pagination-btn nav-btn"
        disabled={page >= totalPages}
        onClick={() => setPage(Math.min(totalPages, page + 1))}
        aria-label="Next page"
        title="Next page"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}
