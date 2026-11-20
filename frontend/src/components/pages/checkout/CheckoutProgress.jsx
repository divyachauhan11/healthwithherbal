/**
 * Checkout progress steps: Bag → Address → Payment.
 * @param {object} props
 * @param {"address"|"payment"} props.step Current checkout step.
 */
export function CheckoutProgress({ step }) {
  return (
    <nav className="checkout-flow-steps" aria-label="Checkout progress">
      <span className="checkout-flow-step complete">Bag</span>
      <span className="checkout-flow-connector" aria-hidden="true" />
      <span
        className={`checkout-flow-step ${step === "address" ? "current" : "complete"}`}
        aria-current={step === "address" ? "step" : undefined}
      >
        Address
      </span>
      <span className="checkout-flow-connector" aria-hidden="true" />
      <span
        className={`checkout-flow-step ${step === "payment" ? "current" : ""}`}
        aria-current={step === "payment" ? "step" : undefined}
      >
        Payment
      </span>
    </nav>
  );
}
