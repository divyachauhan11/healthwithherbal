import { PaginationPageSize } from "./PaginationPageSize";

/**
 * "Showing x–y of z entries" text plus the optional rows-per-page picker.
 * @param {Object} props
 * @param {number} props.startItem First item number on the page.
 * @param {number} props.endItem Last item number on the page.
 * @param {number} props.totalItems
 * @param {number} props.pageSize
 * @param {Array<number>} props.pageSizeOptions
 * @param {(size: number) => void} [props.onPageSizeChange] Shows the picker when set.
 * @param {(page: number) => void} props.setPage
 */
export function PaginationSummary({
  startItem,
  endItem,
  totalItems,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  setPage,
}) {
  return (
    <div className="pagination-info">
      <span>
        Showing{" "}
        <b>
          {startItem}–{endItem}
        </b>{" "}
        of <b>{totalItems}</b> entries
      </span>
      {onPageSizeChange && (
        <PaginationPageSize
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={onPageSizeChange}
          setPage={setPage}
        />
      )}
    </div>
  );
}
