import { useState, useEffect } from "react";
import { getTotalPages } from "./pagination-utils";

/**
 * Client-side pagination state for a list. Jumps back to the first page when
 * the number of rows changes and clamps the page to the available range.
 * @param {Array<Object>} [rows=[]] All rows.
 * @param {number} [initialPageSize=10]
 * @returns {{page: number, setPage: Function, pageSize: number, setPageSize: Function, displayedRows: Array<Object>, totalPages: number, totalItems: number}}
 */
export function useTablePagination(rows = [], initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  useEffect(() => {
    setPage(1);
  }, [rows?.length]);

  const totalPages = getTotalPages(rows?.length || 0, pageSize);
  const validPage = Math.min(page, totalPages);
  const displayedRows = (rows || []).slice(
    (validPage - 1) * pageSize,
    validPage * pageSize,
  );

  return {
    page: validPage,
    setPage,
    pageSize,
    setPageSize,
    displayedRows,
    totalPages,
    totalItems: rows?.length || 0,
  };
}
