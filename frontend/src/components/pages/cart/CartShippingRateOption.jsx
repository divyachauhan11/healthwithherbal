import { formatPrice } from "./cart-utils";

/**
 * Radio-style button for one estimated shipping rate.
 * @param {object} props
 * @param {{name: string, price: number|string, estimatedDays?: string}} props.rate Estimated rate.
 * @param {boolean} props.selected Whether this rate's method is selected.
 * @param {() => void} props.onSelect Selects this rate.
 */
export function CartShippingRateOption({ rate, selected, onSelect }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={`cart-shipping-option${selected ? " selected" : ""}`}
      onClick={onSelect}
    >
      <span className="cart-shipping-radio" aria-hidden="true" />
      <span className="cart-shipping-option-copy">
        <strong>{rate.name}</strong>
        <small>{rate.estimatedDays}</small>
      </span>
      <strong className="cart-shipping-option-price">
        {Number(rate.price) === 0 ? "FREE" : formatPrice(rate.price)}
      </strong>
    </button>
  );
}
