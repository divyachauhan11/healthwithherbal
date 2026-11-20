import { Clock, FileText, Share2, Tag } from "lucide-react";

/**
 * Row of the four cart tools: share cart, order note, shipping and discount.
 * @param {object} props
 * @param {boolean} props.hasOrderNote Marks the note button when a note exists.
 * @param {boolean} props.hasCoupon Marks the discount button when a coupon is applied.
 * @param {(panel: "share"|"note"|"shipping"|"discount") => void} props.onOpen Opens a tool panel.
 */
export function CartToolbar({ hasOrderNote, hasCoupon, onOpen }) {
  return (
    <div className="cart-toolbar-row">
      <button
        type="button"
        className="cart-toolbar-btn"
        onClick={() => onOpen("share")}
      >
        <Share2 size={15} />
        <span>Share cart</span>
      </button>

      <button
        type="button"
        className={`cart-toolbar-btn ${hasOrderNote ? "has-data" : ""}`}
        onClick={() => onOpen("note")}
      >
        <FileText size={15} />
        <span>Order note{hasOrderNote ? " ✓" : ""}</span>
      </button>

      <button
        type="button"
        className="cart-toolbar-btn"
        onClick={() => onOpen("shipping")}
      >
        <Clock size={15} />
        <span>Shipping</span>
      </button>

      <button
        type="button"
        className={`cart-toolbar-btn ${hasCoupon ? "has-data" : ""}`}
        onClick={() => onOpen("discount")}
      >
        <Tag size={15} />
        <span>
          Discount
          <sup>({hasCoupon ? 1 : 0})</sup>
        </span>
      </button>
    </div>
  );
}
