import { useMemo, useState } from "react";
import { useTablePagination } from "../pagination/useTablePagination";
import { getNextSortConfig, getVisibleColumns, sortRows } from "./datatable-utils";

const NO_ROWS = Object.freeze([]);

/**
 * Owns a DataTable's derived rows: visible columns, client-side sorting and
 * built-in pagination.
 * @param {{columns: Array<Object>, data: Array<Object>, rows?: Array<Object>, pageSize: number, pagination: boolean}} options
 * @returns {{safeData: Array<Object>, activeColumns: Array<Object>, sortConfig: {key: string|null, direction: string|null}, handleSort: (column: Object) => void, tablePagination: Object, displayedRows: Array<Object>}}
 */
export function useDataTable({ columns, data, rows, pageSize, pagination }) {
  // Allow passing either `data` or `rows`
  const rawData = rows !== undefined ? rows : data;
  const safeData = Array.isArray(rawData) ? rawData : NO_ROWS;

  // Filter out columns with hide === true
  const activeColumns = useMemo(() => getVisibleColumns(columns, safeData), [columns, safeData]);

  // Client-side Sorting State
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null, // "asc" | "desc" | null
  });

  const handleSort = (column) => {
    if (!column.sortable) return;
    setSortConfig((prev) => getNextSortConfig(prev, column.key));
  };

  const sortedData = useMemo(
    () => sortRows(safeData, sortConfig, activeColumns),
    [safeData, sortConfig, activeColumns],
  );

  // Built-in pagination hook
  const tablePagination = useTablePagination(
    sortedData,
    pagination ? pageSize : Math.max(1, sortedData.length || 1)
  );

  const displayedRows = pagination
    ? tablePagination.displayedRows
    : sortedData;

  return { safeData, activeColumns, sortConfig, handleSort, tablePagination, displayedRows };
}
