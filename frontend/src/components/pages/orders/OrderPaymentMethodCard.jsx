import { CheckCircle2, CreditCard } from "lucide-react";
import { OrderInfoCard } from "./OrderInfoCard";

/** What a PayU (prepaid) order's customer needs to know, by payment status. */
const PAYU_PAYMENT_NOTES = {
  paid: "Paid online through PayU, so nothing is due when your order arrives.",
  failed: "The online payment through PayU was not completed for this order.",
  refunded: "Your online payment through PayU has been refunded.",
};
const PAYU_PENDING_NOTE = "Your online payment through PayU is being confirmed.";

/**
 * "Payment Method" card with the method badge and payment instructions.
 * @param {object} props
 * @param {string} [props.paymentMethod] Order payment method, e.g. "cash_on_delivery".
 * @param {string} [props.paymentStatus] Payment status of a prepaid order, e.g. "paid".
 * @param {number|string} props.total Order total quoted in the instructions.
 */
export function OrderPaymentMethodCard({ paymentMethod, paymentStatus, total }) {
  return (
    <OrderInfoCard icon={CreditCard} title="Payment Method">
      <div className="payment-type-badge">
        <CheckCircle2 size={15} color="#15803d" />
        <span>
          {paymentMethod === "cash_on_delivery"
            ? "Cash on Delivery (Pay on Arrival)"
            : "Prepaid Online"}
        </span>
      </div>
      <p className="payment-instructions">
        {paymentMethod === "cash_on_delivery" ? (
          <>
            No prepayment required. Please keep ₹{total} in
            cash or UPI ready when our courier partner arrives at your
            address.
          </>
        ) : (
          PAYU_PAYMENT_NOTES[paymentStatus] || PAYU_PENDING_NOTE
        )}
      </p>
    </OrderInfoCard>
  );
}
