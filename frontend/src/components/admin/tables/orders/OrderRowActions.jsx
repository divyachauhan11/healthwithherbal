import { Download, Eye, Printer } from "lucide-react";
import { RowActionsMenu } from "../row-actions";
import { downloadOrderInvoice, printOrderInvoice } from "./order-invoice";

/**
 * Row menu for an order: view details, download or print the invoice.
 * @param {{order: Object, onView: (order: Object) => void}} props
 */
export function OrderRowActions({ order, onView }) {
  return (
    <RowActionsMenu
      extraActions={[
        { label: "View details", icon: Eye, onClick: () => onView(order) },
        { label: "Download invoice", icon: Download, onClick: () => downloadOrderInvoice(order) },
        { label: "Print invoice", icon: Printer, onClick: () => printOrderInvoice(order) },
      ]}
    />
  );
}
