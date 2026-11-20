import { RecordStatusBadge, compareRecordProductCounts } from "../shared";
import { BrandNameCell } from "./BrandNameCell";
import { BrandProductCount } from "./BrandProductCount";
import { BrandRowActions } from "./BrandRowActions";

/**
 * DataTable column definitions for the brands table.
 * @param {{onEdit: Function, onDelete: Function, onNavigate?: Function}} handlers
 * @returns {Array<Object>}
 */
export function getBrandColumns({ onEdit, onDelete, onNavigate }) {
  return [
    {
      key: "name",
      label: "Brand",
      sortable: true,
      render: (brand) => <BrandNameCell brand={brand} />,
    },
    { key: "slug", label: "Slug", sortable: true, cellClassName: "muted" },
    {
      key: "count",
      label: "Products",
      sortable: true,
      sortFn: compareRecordProductCounts,
      render: (brand) => <BrandProductCount brand={brand} onNavigate={onNavigate} />,
    },
    {
      key: "isActive",
      label: "Status",
      sortable: true,
      render: (brand) => <RecordStatusBadge status={brand.isActive === false ? "Hidden" : "Active"} />,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (brand) => <BrandRowActions brand={brand} onEdit={onEdit} onDelete={onDelete} />,
    },
  ];
}
