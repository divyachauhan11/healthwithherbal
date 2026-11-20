import { InvoiceItemsTable } from "./InvoiceItemsTable";
import { InvoiceTaxNote } from "./InvoiceTaxNote";
import { InvoiceTotals } from "./InvoiceTotals";

/**
 * "Order summary" section of the invoice: line items, tax note, totals and the delivery note.
 * @param {object} props
 * @param {object} props.order Invoiced order.
 */
export function InvoiceItemsSection({ order }) {
  return (
    <section className="invoice-items-section">
      <h2>Order summary</h2>
      <InvoiceItemsTable items={order.items} />

      <div className="invoice-bottom-grid">
        <InvoiceTaxNote />
        <InvoiceTotals order={order} />
      </div>
      {order.orderNote && <p className="invoice-order-note"><strong>Delivery note:</strong> {order.orderNote}</p>}
    </section>
  );
}
