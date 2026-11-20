/**
 * PayU online payment option with its "Pay Now" button.
 * @param {object} props
 * @param {boolean} props.selected Whether PayU is selected.
 * @param {boolean} props.available Whether PayU is configured.
 * @param {boolean} props.submitting An order is being placed.
 * @param {() => void} props.onPayNow Selects PayU and submits the order.
 */
export function CheckoutPayuOption({ selected, available, submitting, onPayNow }) {
  return (
    <div
      className={`checkout-payment-box checkout-payu-box ${selected ? "selected" : ""}`}
    >
      <div className="checkout-payment-header">
        <div className="checkout-payment-option">
          <span
            className={`payment-radio-indicator ${selected ? "checked" : ""}`}
          />
          <span className="checkout-payment-title">
            Online Payments
          </span>
          <span
            className="checkout-payu-wordmark"
            aria-label="PayU"
          >
            PayU
          </span>
        </div>
        <span className="checkout-payment-badge checkout-payu-badge">
          {available ? "Secure checkout" : "Setup required"}
        </span>
      </div>
      <p className="payment-note">
        Pay securely by credit or debit card, or internet banking
        through PayU.
      </p>
      <button
        className="checkout-payu-pay-now"
        type="button"
        disabled={submitting || !available}
        onClick={onPayNow}
      >
        {available ? "Pay Now" : "Sandbox setup required"}
      </button>
    </div>
  );
}
