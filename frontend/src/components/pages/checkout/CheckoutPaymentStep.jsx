import { Banknote } from "lucide-react";
import { CheckoutCodOption } from "./CheckoutCodOption";
import { CheckoutPayuOption } from "./CheckoutPayuOption";
import { CheckoutTrustBadges } from "./CheckoutTrustBadges";

/**
 * Payment step (inside the checkout form): back link, payment options and
 * trust badges.
 * @param {object} props
 * @param {string} props.paymentMethod "cash_on_delivery" or "payu".
 * @param {boolean} props.payuAvailable Whether PayU is configured.
 * @param {boolean} props.submitting An order is being placed.
 * @param {() => void} props.onBack Returns to the address step.
 * @param {() => void} props.onSelectCashOnDelivery Selects cash on delivery.
 * @param {() => void} props.onPayWithPayu Selects PayU and submits.
 */
export function CheckoutPaymentStep({
  paymentMethod,
  payuAvailable,
  submitting,
  onBack,
  onSelectCashOnDelivery,
  onPayWithPayu,
}) {
  return (
    <>
      <button
        type="button"
        className="checkout-back-to-address"
        onClick={onBack}
      >
        Back to address
      </button>
      <h3 className="checkout-section-title">
        <Banknote size={20} />
        Payment Method
      </h3>

      <CheckoutCodOption
        selected={paymentMethod === "cash_on_delivery"}
        onSelect={onSelectCashOnDelivery}
      />

      <CheckoutPayuOption
        selected={paymentMethod === "payu"}
        available={payuAvailable}
        submitting={submitting}
        onPayNow={onPayWithPayu}
      />

      <CheckoutTrustBadges />
    </>
  );
}
