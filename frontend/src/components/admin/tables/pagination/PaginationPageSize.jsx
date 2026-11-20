/**
 * Rows-per-page select. Changing it also returns to the first page.
 * @param {{pageSize: number, pageSizeOptions: Array<number>, onPageSizeChange: (size: number) => void, setPage: (page: number) => void}} props
 */
export function PaginationPageSize({ pageSize, pageSizeOptions, onPageSizeChange, setPage }) {
  return (
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
  );
}
