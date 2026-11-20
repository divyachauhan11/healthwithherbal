import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

/**
 * One header cell. Sortable columns render a sort button with the current
 * direction icon; other columns render their label as is.
 * @param {{column: Object, sortConfig: {key: string|null, direction: string|null}, onSort: (column: Object) => void}} props
 */
export function DataTableHeaderCell({ column: col, sortConfig, onSort }) {
  const isSortable = !!col.sortable;
  const isSorted = sortConfig.key === col.key && sortConfig.direction;
  const alignStyle = col.align ? { textAlign: col.align } : {};
  const widthStyle = col.width ? { width: col.width } : {};

  return (
    <th
      className={col.className || ""}
      style={{ ...alignStyle, ...widthStyle, ...col.style }}
    >
      {isSortable ? (
        <button
          type="button"
          className={`datatable-sort-btn ${isSorted ? "active" : ""}`}
          onClick={() => onSort(col)}
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
}
