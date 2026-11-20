import { ShieldCheck } from "lucide-react";

/**
 * Checkout column heading: "Secure checkout" eyebrow, step title and subtitle.
 * @param {object} props
 * @param {"address"|"payment"} props.step Current checkout step.
 */
export function CheckoutIntro({ step }) {
  return (
    <>
      <span className="eyebrow">
        <ShieldCheck size={14} />
        Secure checkout
      </span>
      <h1>
        {step === "address" ? "Delivery details" : "Payment method"}
      </h1>
      <p className="checkout-subtitle">
        {step === "address"
          ? "Confirm your delivery address to continue with your herbal order."
          : "Choose how you would like to pay for your herbal order."}
      </p>
    </>
  );
}
