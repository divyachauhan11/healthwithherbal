import { DataTable } from "@/components/admin/tables";
import { money } from "./invoice-utils";

const INVOICE_COLUMNS = [
  {
    key: "item",
    label: "Item",
    render: (item) => (
      <>
        <strong>{item.titleSnapshot || item.title || "Product"}</strong>
        {(item.brandSnapshot || item.brand) && <small>{item.brandSnapshot || item.brand}</small>}
      </>
    ),
  },
  { key: "skuSnapshot", label: "SKU", render: (item) => item.skuSnapshot || item.sku || "—" },
  { key: "quantity", label: "Qty.", className: "numeric", cellClassName: "numeric" },
  { key: "unitPrice", label: "Unit price", className: "numeric", cellClassName: "numeric", render: (item) => money(item.unitPrice) },
  { key: "lineTotal", label: "Line total", className: "numeric", cellClassName: "numeric", render: (item) => money(item.lineTotal ?? Number(item.unitPrice) * Number(item.quantity)) },
];

const invoiceRowKey = (item, index) => `${item.legacyId || item.product || item.title}-${index}`;

/**
 * Invoice line items table (item, SKU, quantity, unit price, line total).
 * @param {object} props
 * @param {object[]} [props.items] Order lines.
 */
export function InvoiceItemsTable({ items }) {
  return (
    <div className="invoice-table-wrap">
      <DataTable
        data={items || []}
        rowKey={invoiceRowKey}
        pagination={false}
        tableClassName="invoice-table"
        columns={INVOICE_COLUMNS}
      />
    </div>
  );
}
