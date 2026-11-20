"use client";

import { useMemo } from "react";
import { DataTable } from "./DataTable";
import { getBrandColumns } from "./brands";

/**
 * Brands table with product counts and edit/delete row actions.
 * @param {Object} props
 * @param {Array<Object>} [props.rows=[]] Brands.
 * @param {(brand: Object) => void} props.onEdit
 * @param {(brand: Object) => void} props.onDelete
 * @param {Function} [props.onNavigate] Admin navigation (page, filter).
 * @param {number} [props.pageSize=10] Initial rows per page.
 */
export function BrandTable({ rows = [], onEdit, onDelete, onNavigate, pageSize = 10 }) {
  const columns = useMemo(
    () => getBrandColumns({ onEdit, onDelete, onNavigate }),
    [onEdit, onDelete, onNavigate],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      pageSize={pageSize}
      emptyMessage="No brands found."
    />
  );
}
