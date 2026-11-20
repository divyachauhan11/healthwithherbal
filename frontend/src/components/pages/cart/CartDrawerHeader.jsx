import { X } from "lucide-react";

/**
 * Cart drawer title bar: "Your cart" with the unit count and a close button.
 * @param {object} props
 * @param {number} props.itemCount Units in the cart.
 * @param {() => void} props.onClose Closes the drawer.
 */
export function CartDrawerHeader({ itemCount, onClose }) {
  return (
    <div className="cart-modal-header">
      <div className="cart-modal-title">
        <h2>Your cart</h2>
        <span className="cart-badge-count">{itemCount}</span>
      </div>
      <button
        type="button"
        className="cart-modal-close-btn"
        onClick={onClose}
        aria-label="Close cart modal"
      >
        <X size={18} />
      </button>
    </div>
  );
}
