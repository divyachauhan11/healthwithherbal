"use client";
import { Minus } from "lucide-react";

/**
 * Minus / quantity / plus control.
 * @param {object} props
 * @param {number} props.quantity
 * @param {() => void} props.onDecrease
 * @param {() => void} props.onIncrease
 * @param {boolean} props.increaseDisabled
 */
export function QuantityStepper({ quantity, onDecrease, onIncrease, increaseDisabled }) {
  return (
    <div className="quantity">
      <button
        type="button"
        onClick={onDecrease}
      >
        <Minus size={15} />
      </button>
      <span>{quantity}</span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={increaseDisabled}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
