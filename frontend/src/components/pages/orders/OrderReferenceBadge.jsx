import { Calendar, Check, Copy } from "lucide-react";
import { formatOrderDateTime } from "./order-utils";

/**
 * Order reference pill with a copy button and the order date.
 * @param {object} props
 * @param {string} [props.orderNumber] Order reference shown and copied.
 * @param {string} [props.createdAt] Order creation date (now when missing).
 * @param {boolean} props.copied Show the "Copied" confirmation instead of "Copy".
 * @param {() => void} props.onCopy Copies the order reference.
 */
export function OrderReferenceBadge({ orderNumber, createdAt, copied, onCopy }) {
  return (
    <div className="order-id-badge-card">
      <div className="order-id-group">
        <span className="order-id-label">Order Reference:</span>
        <strong className="order-id-value">
          {orderNumber}
        </strong>
        <button
          type="button"
          className="copy-order-btn"
          onClick={onCopy}
          title="Copy Order Reference"
        >
          {copied ? (
            <>
              <Check size={14} color="#15803d" /> Copied
            </>
          ) : (
            <>
              <Copy size={14} /> Copy
            </>
          )}
        </button>
      </div>
      <div className="order-date-pill">
        <Calendar size={13} />
        <span>{formatOrderDateTime(createdAt)}</span>
      </div>
    </div>
  );
}
