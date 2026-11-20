import { PaginationControls, PaginationSummary, getPageNumbers, getTotalPages } from "./pagination";

export { useTablePagination } from "./pagination";

/**
 * Pagination bar: item range summary, optional rows-per-page picker and page
 * buttons. Renders nothing when there are no items.
 * @param {Object} props
 * @param {number} props.totalItems
 * @param {number} props.page Current page (1-based).
 * @param {(page: number) => void} props.setPage
 * @param {number} [props.pageSize=10]
 * @param {(size: number) => void} [props.onPageSizeChange] Shows the rows-per-page picker when set.
 * @param {Array<number>} [props.pageSizeOptions=[10, 25, 50]]
 */
export function TablePagination({
  totalItems,
  page,
  setPage,
  pageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
}) {
  const totalPages = getTotalPages(totalItems, pageSize);

  if (!totalItems || totalItems <= 0) return null;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="table-pagination-bar">
      <PaginationSummary
        startItem={startItem}
        endItem={endItem}
        totalItems={totalItems}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={onPageSizeChange}
        setPage={setPage}
      />

      <PaginationControls
        page={page}
        totalPages={totalPages}
        pages={pages}
        setPage={setPage}
      />
    </div>
  );
}
