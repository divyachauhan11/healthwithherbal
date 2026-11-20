import { DataTableCell } from "./DataTableCell";

/**
 * One body row; clickable when `onRowClick` is provided.
 * @param {Object} props
 * @param {Object} props.row Row data.
 * @param {number} props.rowIndex Index within the current page.
 * @param {Array<Object>} props.columns Visible columns.
 * @param {number} props.page Current page (1-based).
 * @param {number} props.pageSize Rows per page.
 * @param {(row: Object, index: number, event: Event) => void} [props.onRowClick]
 * @param {string|((row: Object, index: number) => string)} [props.rowClassName]
 */
export function DataTableRow({ row, rowIndex: rIdx, columns, page, pageSize, onRowClick, rowClassName }) {
  const isClickable = typeof onRowClick === "function";
  const rowCustomClass =
    typeof rowClassName === "function"
      ? rowClassName(row, rIdx)
      : rowClassName || "";

  return (
    <tr
      className={`${isClickable ? "datatable-row-clickable" : ""} ${rowCustomClass}`.trim()}
      onClick={isClickable ? (e) => onRowClick(row, rIdx, e) : undefined}
    >
      {columns.map((col, cIdx) => (
        <DataTableCell
          key={col.key || `td-${cIdx}`}
          column={col}
          row={row}
          rowIndex={rIdx}
          page={page}
          pageSize={pageSize}
        />
      ))}
    </tr>
  );
}
