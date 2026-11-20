import { currency, dateLabel } from "../../global/admin-utils";
import { CustomerRowActions } from "./CustomerRowActions";

/**
 * DataTable column definitions for the customers table.
 * @param {{onView?: Function, onSuspend?: Function}} handlers Row action handlers (each receives the customer).
 * @returns {Array<Object>}
 */
export function getCustomerColumns({ onView, onSuspend }) {
  return [
    {
      key: "name",
      label: "Customer",
      sortable: true,
      render: (customer) => <b>{customer.name || "Customer"}</b>,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (customer) => customer.email || "—",
    },
    {
      key: "orders",
      label: "Orders",
      sortable: true,
      render: (customer) => customer.orders ?? 0,
    },
    {
      key: "spent",
      label: "Total spent",
      sortable: true,
      render: (customer) => <b>{currency(customer.spent)}</b>,
    },
    {
      key: "lastOrder",
      label: "Last order",
      sortable: true,
      render: (customer) => dateLabel(customer.lastOrder),
    },
    {
      key: "details",
      label: "Actions",
      align: "right",
      render: (customer) => (
        <CustomerRowActions customer={customer} onView={onView} onSuspend={onSuspend} />
      ),
    },
  ];
}
