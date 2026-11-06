import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function TablePagination({
  totalItems,
  page,
  setPage,
  pageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (!totalItems || totalItems <= 0) return null;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }
    if (page >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  const pages = getPageNumbers();

  return (
    <div className="table-pagination-bar">
      <div className="pagination-info">
        <span>
          Showing{" "}
          <b>
            {startItem}–{endItem}
          </b>{" "}
          of <b>{totalItems}</b> entries
        </span>
        {onPageSizeChange && (
          <label className="pagination-page-size">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                setPage(1);
              }}
              className="pagination-select"
              aria-label="Rows per page"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span>per page</span>
          </label>
        )}
      </div>

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
            <button
              key={`page-${p}`}
              type="button"
              className={`pagination-btn ${page === p ? "current active" : ""}`}
              onClick={() => setPage(p)}
              aria-label={`Page ${p}`}
              aria-current={page === p ? "page" : undefined}
            >
              {p}
            </button>
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
    </div>
  );
}

export function useTablePagination(rows = [], initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  useEffect(() => {
    setPage(1);
  }, [rows?.length]);

  const totalPages = Math.max(1, Math.ceil((rows?.length || 0) / pageSize));
  const validPage = Math.min(page, totalPages);
  const displayedRows = (rows || []).slice(
    (validPage - 1) * pageSize,
    validPage * pageSize,
  );

  return {
    page: validPage,
    setPage,
    pageSize,
    setPageSize,
    displayedRows,
    totalPages,
    totalItems: rows?.length || 0,
  };
}
