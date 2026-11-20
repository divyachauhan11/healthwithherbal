import { Empty } from "../global/Empty";
import { TablePagination } from "./TablePagination";
import {
  DataTableEmptyRow,
  DataTableHead,
  DataTableRow,
  DataTableSkeletonRows,
  resolveRowKey,
  useDataTable,
} from "./datatable";

/**
 * Global Reusable DataTable Component
 *
 * @param {Array} columns - Array of column definitions:
 *   - key {string}: Field name or unique identifier
 *   - label {ReactNode}: Header label
 *   - render {Function}: Optional custom cell renderer: (row, index, meta) => ReactNode
 *   - align {"left"|"center"|"right"}: Text alignment (default: "left")
 *   - width {string|number}: Width of column (e.g. "120px", "15%")
 *   - sortable {boolean}: Enable client-side column sorting
 *   - sortFn {Function}: Custom sort comparator: (a, b) => number
 *   - className {string}: Header cell CSS class
 *   - cellClassName {string|Function}: Body cell CSS class or (row) => string
 *   - style {Object}: Header cell inline styles
 *   - cellStyle {Object|Function}: Body cell inline styles or (row) => Object
 *   - hide {boolean|Function}: Conditionally hide this column
 *
 * @param {Array} data - Array of row objects (alias: `rows`)
 * @param {string|Function} rowKey - Key extractor (default: row._id || row.id || index)
 * @param {number} pageSize - Number of rows per page (default: 10)
 * @param {Array} pageSizeOptions - Available page size choices (default: [10, 25, 50])
 * @param {boolean} pagination - Enable/disable pagination bar (default: true)
 * @param {boolean} loading - Display loading skeleton state (default: false)
 * @param {number} skeletonRows - Number of skeleton rows when loading (default: 5)
 * @param {ReactNode} emptyMessage - Custom text or node for empty data (default: "No records found.")
 * @param {ReactNode} emptyState - Optional node rendered instead of the empty message
 * @param {Function} onRowClick - Optional click handler for row: (row, index) => void
 * @param {string|Function} rowClassName - CSS class for <tr> or (row, index) => string
 * @param {string} className - Optional wrapper class
 * @param {string} tableClassName - Optional table element class
 */
export function DataTable({
  columns = [],
  data = [],
  rows,
  rowKey,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50],
  pagination = true,
  loading = false,
  skeletonRows = 5,
  emptyMessage = "No records found.",
  emptyState,
  onRowClick,
  rowClassName,
  className = "",
  tableClassName = "",
}) {
  const { safeData, activeColumns, sortConfig, handleSort, tablePagination, displayedRows } =
    useDataTable({ columns, data, rows, pageSize, pagination });

  return (
    <div className={`datatable-container ${className}`}>
      <div className="table-wrap">
        <table className={tableClassName}>
          <DataTableHead columns={activeColumns} sortConfig={sortConfig} onSort={handleSort} />
          <tbody>
            {loading ? (
              // Skeleton Loading Rows
              <DataTableSkeletonRows columns={activeColumns} rowCount={skeletonRows} />
            ) : displayedRows.length > 0 ? (
              // Data Rows
              displayedRows.map((row, rIdx) => (
                <DataTableRow
                  key={resolveRowKey(rowKey, row, rIdx)}
                  row={row}
                  rowIndex={rIdx}
                  columns={activeColumns}
                  page={tablePagination.page}
                  pageSize={tablePagination.pageSize}
                  onRowClick={onRowClick}
                  rowClassName={rowClassName}
                />
              ))
            ) : (
              // Empty State
              <DataTableEmptyRow colSpan={Math.max(1, activeColumns.length)}>
                {emptyState ?? <Empty>{emptyMessage}</Empty>}
              </DataTableEmptyRow>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {pagination && !loading && safeData.length > 0 && (
        <TablePagination
          totalItems={tablePagination.totalItems}
          page={tablePagination.page}
          setPage={tablePagination.setPage}
          pageSize={tablePagination.pageSize}
          onPageSizeChange={tablePagination.setPageSize}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  );
}

export default DataTable;
