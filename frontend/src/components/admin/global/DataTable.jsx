import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Empty } from "./AdminUI";
import { TablePagination, useTablePagination } from "./TablePagination";

/**
 * Safely resolves nested property keys (e.g. "category.name" or "user.email")
 */
function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;
  if (!path.includes(".")) return obj[path];
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
}

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
  onRowClick,
  rowClassName,
  className = "",
  tableClassName = "",
}) {
  // Allow passing either `data` or `rows`
  const rawData = rows !== undefined ? rows : data;
  const safeData = Array.isArray(rawData) ? rawData : [];

  // Filter out columns with hide === true
  const activeColumns = useMemo(() => {
    return columns.filter((col) => {
      if (!col) return false;
      if (typeof col.hide === "function") return !col.hide(safeData);
      return !col.hide;
    });
  }, [columns, safeData]);

  // Client-side Sorting State
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null, // "asc" | "desc" | null
  });

  const handleSort = (column) => {
    if (!column.sortable) return;
    const key = column.key;

    setSortConfig((prev) => {
      if (prev.key !== key) {
        return { key, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { key, direction: "desc" };
      }
      return { key: null, direction: null };
    });
  };

  // Sorted Data Memo
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return safeData;
    }

    const activeCol = activeColumns.find((c) => c.key === sortConfig.key);
    const customSort = activeCol?.sortFn;

    return [...safeData].sort((a, b) => {
      if (customSort) {
        const res = customSort(a, b);
        return sortConfig.direction === "asc" ? res : -res;
      }

      const valA = getNestedValue(a, sortConfig.key);
      const valB = getNestedValue(b, sortConfig.key);

      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      let comparison = 0;
      if (typeof valA === "number" && typeof valB === "number") {
        comparison = valA - valB;
      } else if (typeof valA === "string" && typeof valB === "string") {
        comparison = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: "base" });
      } else {
        comparison = String(valA) > String(valB) ? 1 : -1;
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [safeData, sortConfig, activeColumns]);

  // Built-in pagination hook
  const tablePagination = useTablePagination(
    sortedData,
    pagination ? pageSize : Math.max(1, sortedData.length || 1)
  );

  const displayedRows = pagination
    ? tablePagination.displayedRows
    : sortedData;

  const getRowKey = (row, index) => {
    if (typeof rowKey === "function") return rowKey(row, index);
    if (typeof rowKey === "string" && row?.[rowKey] !== undefined) return row[rowKey];
    return row?._id || row?.id || index;
  };

  return (
    <div className={`datatable-container ${className}`}>
      <div className="table-wrap">
        <table className={tableClassName}>
          <thead>
            <tr>
              {activeColumns.map((col, idx) => {
                const isSortable = !!col.sortable;
                const isSorted = sortConfig.key === col.key && sortConfig.direction;
                const alignStyle = col.align ? { textAlign: col.align } : {};
                const widthStyle = col.width ? { width: col.width } : {};

                return (
                  <th
                    key={col.key || `th-${idx}`}
                    className={col.className || ""}
                    style={{ ...alignStyle, ...widthStyle, ...col.style }}
                  >
                    {isSortable ? (
                      <button
                        type="button"
                        className={`datatable-sort-btn ${isSorted ? "active" : ""}`}
                        onClick={() => handleSort(col)}
                        title={`Sort by ${typeof col.label === "string" ? col.label : col.key}`}
                      >
                        <span>{col.label}</span>
                        {isSorted ? (
                          sortConfig.direction === "asc" ? (
                            <ArrowUp size={13} className="datatable-sort-icon" />
                          ) : (
                            <ArrowDown size={13} className="datatable-sort-icon" />
                          )
                        ) : (
                          <ArrowUpDown size={12} className="datatable-sort-icon" />
                        )}
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Skeleton Loading Rows
              Array.from({ length: skeletonRows }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`}>
                  {activeColumns.map((col, cIdx) => (
                    <td key={`skeleton-${rIdx}-${cIdx}`}>
                      <div
                        className="datatable-skeleton-cell"
                        style={{
                          width: cIdx === 0 ? "70%" : cIdx === 1 ? "45%" : "60%",
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : displayedRows.length > 0 ? (
              // Data Rows
              displayedRows.map((row, rIdx) => {
                const key = getRowKey(row, rIdx);
                const isClickable = typeof onRowClick === "function";
                const rowCustomClass =
                  typeof rowClassName === "function"
                    ? rowClassName(row, rIdx)
                    : rowClassName || "";

                return (
                  <tr
                    key={key}
                    className={`${isClickable ? "datatable-row-clickable" : ""} ${rowCustomClass}`.trim()}
                    onClick={isClickable ? (e) => onRowClick(row, rIdx, e) : undefined}
                  >
                    {activeColumns.map((col, cIdx) => {
                      const alignStyle = col.align ? { textAlign: col.align } : {};
                      const cellClass =
                        typeof col.cellClassName === "function"
                          ? col.cellClassName(row)
                          : col.cellClassName || "";
                      const cellStyle =
                        typeof col.cellStyle === "function"
                          ? col.cellStyle(row)
                          : col.cellStyle || {};

                      const cellContent = col.render
                        ? col.render(row, rIdx, {
                            page: tablePagination.page,
                            pageSize: tablePagination.pageSize,
                            indexInPage: rIdx,
                            globalIndex:
                              (tablePagination.page - 1) * tablePagination.pageSize + rIdx,
                          })
                        : getNestedValue(row, col.key) ?? "—";

                      return (
                        <td
                          key={col.key || `td-${cIdx}`}
                          className={cellClass}
                          style={{ ...alignStyle, ...cellStyle }}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              // Empty State
              <tr>
                <td colSpan={Math.max(1, activeColumns.length)}>
                  <Empty>{emptyMessage}</Empty>
                </td>
              </tr>
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
