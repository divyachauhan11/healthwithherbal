import { FileText } from "lucide-react";

/**
 * The customer's delivery note attached to the order.
 * @param {object} props
 * @param {string} props.note Order note text.
 */
export function OrderNoteBox({ note }) {
  return (
    <div className="order-customer-note-box">
      <FileText size={16} />
      <div>
        <strong>Special Delivery Note:</strong>
        <p>{note}</p>
      </div>
    </div>
  );
}
