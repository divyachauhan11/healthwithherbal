import { Minus, Plus } from "lucide-react";

/**
 * Pill-shaped quantity stepper for a cart line item.
 * @param {object} props
 * @param {number} props.quantity Current quantity.
 * @param {() => void} props.onDecrease Removes one unit.
 * @param {() => void} props.onIncrease Adds one unit.
 */
export function CartQuantityStepper({ quantity, onDecrease, onIncrease }) {
  return (
    <div className="cart-qty-pill">
      <button
        type="button"
        className="cart-qty-btn"
        onClick={onDecrease}
        aria-label="Decrease quantity"
      >
        <Minus size={13} strokeWidth={2.2} />
      </button>
      <span className="cart-qty-value">{quantity}</span>
      <button
        type="button"
        className="cart-qty-btn"
        onClick={onIncrease}
        aria-label="Increase quantity"
      >
        <Plus size={13} strokeWidth={2.2} />
      </button>
    </div>
  );
}
