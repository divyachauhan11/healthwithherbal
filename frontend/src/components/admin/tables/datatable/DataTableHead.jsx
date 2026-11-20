import { DataTableHeaderCell } from "./DataTableHeaderCell";

/**
 * Table header row with one (optionally sortable) cell per visible column.
 * @param {{columns: Array<Object>, sortConfig: {key: string|null, direction: string|null}, onSort: (column: Object) => void}} props
 */
export function DataTableHead({ columns, sortConfig, onSort }) {
  return (
    <thead>
      <tr>
        {columns.map((col, idx) => (
          <DataTableHeaderCell
            key={col.key || `th-${idx}`}
            column={col}
            sortConfig={sortConfig}
            onSort={onSort}
          />
        ))}
      </tr>
    </thead>
  );
}
