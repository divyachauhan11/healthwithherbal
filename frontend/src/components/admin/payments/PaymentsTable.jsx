import { Eye } from "lucide-react";
import { DataTable, RowActionsMenu } from "@/components/admin/tables";
import { currency, dateLabel } from "@/components/admin/global/admin-utils";
import { PaymentStatusSelect } from "./PaymentStatusSelect";
import { getCustomerDisplayName } from "./payment-utils";

/**
 * Paginated payments table with an inline status select and a "View" row action.
 * @param {{
 *   rows: Array<object>, hasPayments: boolean, updatingPaymentId: string|null,
 *   onStatusChange: (payment: object, status: string) => void, onView: (payment: object) => void
 * }} props `hasPayments` selects the empty-state copy.
 */
export function PaymentsTable({ rows, hasPayments, updatingPaymentId, onStatusChange, onView }) {
  const columns = [
    { key: "payment", label: "Payment", render: (payment) => <><strong>{String(payment._id || "").slice(-8).toUpperCase() || "—"}</strong><small>{payment.gatewayTxnId || "No transaction reference"}</small></> },
    { key: "orderNumber", label: "Order", sortable: true, render: (payment) => <><strong>#{payment.orderNumber || "—"}</strong><small>{payment.orderStatus || "Status unavailable"}</small></> },
    { key: "customer", label: "Customer", render: (payment) => <><strong>{getCustomerDisplayName(payment.customer)}</strong><small>{payment.customer?.email || "—"}</small></> },
    { key: "method", label: "Method", render: (payment) => <><strong>{String(payment.method || "—").replaceAll("_", " ")}</strong><small>{payment.gateway || "—"}</small></> },
    { key: "status", label: "Status", render: (payment) => <PaymentStatusSelect payment={payment} disabled={updatingPaymentId === payment._id} onStatusChange={onStatusChange} /> },
    { key: "amount", label: "Amount", sortable: true, render: (payment) => <strong>{currency(payment.amount, payment.currency || "INR")}</strong> },
    { key: "createdAt", label: "Date", sortable: true, render: (payment) => dateLabel(payment.createdAt) },
    { key: "actions", label: "Actions", render: (payment) => <RowActionsMenu extraActions={[{ label: "View", icon: Eye, onClick: () => onView(payment) }]} /> },
  ];

  return (
    <div className="payments-table-wrap">
      <DataTable
        data={rows}
        columns={columns}
        rowKey="_id"
        pageSize={10}
        tableClassName="payments-table"
        emptyMessage={hasPayments ? "No payments match this filter." : "Payment records will appear here when orders are placed."}
      />
    </div>
  );
}
