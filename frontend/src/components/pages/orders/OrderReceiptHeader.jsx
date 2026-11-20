import { Package } from "lucide-react";

/**
 * Header of the items card: item count and the status pill.
 * @param {object} props
 * @param {number} props.itemCount Number of order lines.
 * @param {string} props.status Lower-cased order status.
 */
export function OrderReceiptHeader({ itemCount, status }) {
  return (
    <div className="receipt-card-header">
      <div
        style={{ display: "flex", alignItems: "center", gap: "8px" }}
      >
        <Package size={18} color="var(--forest)" />
        <h2>Items in this Order ({itemCount})</h2>
      </div>
      <span className={`receipt-status-pill status-${status}`}>
        {status.toUpperCase()}
      </span>
    </div>
  );
}
