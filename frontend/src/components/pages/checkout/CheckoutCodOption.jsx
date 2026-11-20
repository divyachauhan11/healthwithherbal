/**
 * Cash on delivery payment option (a toggle button).
 * @param {object} props
 * @param {boolean} props.selected Whether cash on delivery is selected.
 * @param {() => void} props.onSelect Selects cash on delivery.
 */
export function CheckoutCodOption({ selected, onSelect }) {
  return (
    <button
      type="button"
      className={`checkout-payment-box ${selected ? "selected" : ""}`}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <div className="checkout-payment-header">
        <div className="checkout-payment-option">
          <span
            className={`payment-radio-indicator ${selected ? "checked" : ""}`}
          />
          <span className="checkout-payment-title">
            Cash on Delivery (COD)
          </span>
        </div>
        <span className="checkout-payment-badge">Available</span>
      </div>
      <p className="payment-note">
        Pay securely with cash or UPI QR at your doorstep when your
        order arrives. No advance payment required.
      </p>
    </button>
  );
}
