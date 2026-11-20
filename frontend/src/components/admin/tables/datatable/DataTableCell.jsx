import { getNestedValue } from "./datatable-utils";

/**
 * One body cell: the column's `render(row, index, meta)` output, or the row's
 * value at the column key ("—" when empty).
 * @param {{column: Object, row: Object, rowIndex: number, page: number, pageSize: number}} props
 */
export function DataTableCell({ column: col, row, rowIndex: rIdx, page, pageSize }) {
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
        page,
        pageSize,
        indexInPage: rIdx,
        globalIndex:
          (page - 1) * pageSize + rIdx,
      })
    : getNestedValue(row, col.key) ?? "—";

  return (
    <td
      className={cellClass}
      style={{ ...alignStyle, ...cellStyle }}
    >
      {cellContent}
    </td>
  );
}
