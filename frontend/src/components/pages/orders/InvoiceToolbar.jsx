import { ArrowLeft, Printer } from "lucide-react";

/**
 * Screen-only toolbar above the invoice: back to the order and print.
 * @param {object} props
 * @param {() => void} props.onBack Returns to the order details page.
 */
export function InvoiceToolbar({ onBack }) {
  return (
    <div className="invoice-toolbar no-print">
      <button type="button" className="invoice-back" onClick={onBack}>
        <ArrowLeft size={17} /> Back to order
      </button>
      <button type="button" className="app-button" onClick={() => window.print()}>
        <Printer size={16} /> Print / Save as PDF
      </button>
    </div>
  );
}
