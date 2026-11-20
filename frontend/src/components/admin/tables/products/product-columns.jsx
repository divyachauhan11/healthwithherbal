import { currency } from "../../global/admin-utils";
import { ProductBadgeCell } from "./ProductBadgeCell";
import { ProductRowActions } from "./ProductRowActions";
import { ProductStatusBadge } from "./ProductStatusBadge";
import { ProductTitleCell } from "./ProductTitleCell";

/**
 * DataTable column definitions for the products table.
 * @param {{onEdit: Function, onDelete: Function, onToggleStatus?: Function}} handlers Row action handlers (each receives the product).
 * @returns {Array<Object>}
 */
export function getProductColumns({ onEdit, onDelete, onToggleStatus }) {
  return [
    {
      key: "title",
      label: "Product",
      sortable: true,
      render: (product) => <ProductTitleCell product={product} />,
    },
    {
      key: "sku",
      label: "SKU",
      cellClassName: "muted",
      sortable: true,
      render: (product) => product.sku || "—",
    },
    {
      key: "brand",
      label: "Brand",
      sortable: true,
      render: (product) => product.brand || "—",
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      render: (product) => product.category || "—",
    },
    {
      key: "stockQty",
      label: "Stock",
      sortable: true,
      render: (product) => product.stockQty ?? 0,
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (product) => <b>{currency(product.price)}</b>,
    },
    {
      key: "badge",
      label: "Badge",
      sortable: true,
      render: (product) => <ProductBadgeCell badge={product.badge} />,
    },
    {
      key: "active",
      label: "Status",
      sortable: true,
      render: (product) => <ProductStatusBadge product={product} />,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (product) => (
        <ProductRowActions
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ),
    },
  ];
}
