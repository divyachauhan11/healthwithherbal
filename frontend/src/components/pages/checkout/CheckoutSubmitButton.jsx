import { Loader2 } from "lucide-react";

/**
 * Primary checkout button: "Continue to payment" on the address step, then
 * "Place Order"/"Pay Now" with the total (or a spinner while placing).
 * @param {object} props
 * @param {"address"|"payment"} props.step Current checkout step.
 * @param {string} props.paymentMethod "cash_on_delivery" or "payu".
 * @param {number} props.total Order total.
 * @param {boolean} props.submitting An order is being placed.
 * @param {boolean} props.disabled Disables the button.
 * @param {() => void} props.onClick Continues or submits the current step.
 */
export function CheckoutSubmitButton({
  step,
  paymentMethod,
  total,
  submitting,
  disabled,
  onClick,
}) {
  return (
    <button
      type="button"
      className="checkout-submit-btn"
      disabled={disabled}
      onClick={onClick}
    >
      {step === "address" ? (
        <span>Continue to payment</span>
      ) : submitting ? (
        <>
          <Loader2 size={18} className="spin-animate" />
          Placing your order…
        </>
      ) : (
        <span>{paymentMethod === "payu" ? "Pay Now" : "Place Order"} · ₹{total.toFixed(2)}</span>
      )}
    </button>
  );
}
