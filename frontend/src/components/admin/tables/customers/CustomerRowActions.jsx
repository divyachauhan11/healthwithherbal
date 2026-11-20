import { Ban, CheckCircle2, Eye } from "lucide-react";
import { RowActionsMenu } from "../row-actions";

/**
 * Row menu for a customer: view details, and suspend/reactivate for customers
 * with an account.
 * @param {{customer: Object, onView?: Function, onSuspend?: Function}} props
 */
export function CustomerRowActions({ customer, onView, onSuspend }) {
  return (
    <RowActionsMenu
      onEdit={() => onView?.(customer)}
      editLabel="View details"
      editIcon={Eye}
      extraActions={customer.hasAccount ? [{
        label: customer.isActive === false ? "Reactivate customer" : "Suspend customer",
        icon: customer.isActive === false ? CheckCircle2 : Ban,
        danger: customer.isActive !== false,
        onClick: () => onSuspend?.(customer),
      }] : []}
      align="right"
    />
  );
}
