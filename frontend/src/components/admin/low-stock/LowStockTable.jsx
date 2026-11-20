import { Eye, EyeOff } from "lucide-react";
import { currency } from "@/components/admin/global";
import { DataTable, RowActionsMenu } from "@/components/admin/tables";
import { LowStockBadge } from "./LowStockBadge";
import { LowStockProductCell } from "./LowStockProductCell";
import { LowStockRestockControls } from "./LowStockRestockControls";

/**
 * Paginated table of low-stock products with restock controls and row actions.
 * @param {{
 *   items: Array<object>, query: string, restockingId: string|null,
 *   customStockInputs: Object<string, string>, onCustomStockChange: Function,
 *   onQuickRestock: Function, onSetExactStock: Function, onEdit: (product: object) => void,
 *   onToggleActive?: (product: object) => void, onDelete: (product: object) => void
 * }} props
 */
export function LowStockTable({
  items,
  query,
  restockingId,
  customStockInputs,
  onCustomStockChange,
  onQuickRestock,
  onSetExactStock,
  onEdit,
  onToggleActive,
  onDelete,
}) {
  return (
    <DataTable
      className="low-stock-data-table"
      tableClassName="low-stock-table"
      data={items}
      rowKey="_id"
      pageSize={10}
      pageSizeOptions={[10, 25, 50]}
      emptyMessage={query
        ? "No low stock products match your search query."
        : "No products currently below this stock threshold."}
      columns={[
        {
          key: "title",
          label: "Product",
          sortable: true,
          render: (product) => <LowStockProductCell product={product} />,
        },
        { key: "sku", label: "SKU", sortable: true, cellClassName: "muted" },
        { key: "category", label: "Category", sortable: true },
        {
          key: "stockQty",
          label: "Current Stock",
          sortable: true,
          render: (product) => <LowStockBadge product={product} />,
        },
        {
          key: "price",
          label: "Price",
          sortable: true,
          render: (product) => <b>{currency(product.price)}</b>,
        },
        {
          key: "quickRestock",
          label: "Quick Restock",
          width: "210px",
          render: (product) => (
            <LowStockRestockControls
              product={product}
              isRestocking={restockingId === product._id}
              customValue={customStockInputs[product._id]}
              onQuickRestock={onQuickRestock}
              onCustomValueChange={onCustomStockChange}
              onSetExactStock={onSetExactStock}
            />
          ),
        },
        {
          key: "actions",
          label: "Actions",
          render: (product) => (
            <RowActionsMenu
              onEdit={() => onEdit(product)}
              onHide={onToggleActive ? () => onToggleActive(product) : undefined}
              hideLabel={product.active === false ? "Unhide product" : "Hide product"}
              hideIcon={product.active === false ? Eye : EyeOff}
              hideVariant={product.active === false ? "success" : "warning"}
              onDelete={() => onDelete(product)}
              editLabel="Edit"
              deleteLabel="Delete"
            />
          ),
        },
      ]}
    />
  );
}
