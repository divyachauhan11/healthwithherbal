import { ShoppingBag } from "lucide-react";

/**
 * Empty cart message with a "Start Shopping" button.
 * @param {object} props
 * @param {() => void} props.onStartShopping Called by the button (closes the drawer).
 */
export function CartEmptyState({ onStartShopping }) {
  return (
    <div className="cart-empty-view">
      <div className="cart-empty-circle">
        <ShoppingBag size={40} />
      </div>
      <h3>Your cart is empty</h3>
      <p>Fill it with authentic herbal formulations and wellness care.</p>
      <button
        type="button"
        className="cart-primary-action-btn empty-btn"
        onClick={onStartShopping}
      >
        Start Shopping
      </button>
    </div>
  );
}
