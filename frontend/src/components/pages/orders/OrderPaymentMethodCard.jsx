import { CheckCircle2, CreditCard } from "lucide-react";
import { OrderInfoCard } from "./OrderInfoCard";

/**
 * "Payment Method" card with the method badge and payment instructions.
 * @param {object} props
 * @param {string} [props.paymentMethod] Order payment method, e.g. "cash_on_delivery".
 * @param {number|string} props.total Order total quoted in the instructions.
 */
export function OrderPaymentMethodCard({ paymentMethod, total }) {
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
        No prepayment required. Please keep ₹{total} in
        cash or UPI ready when our courier partner arrives at your
        address.
      </p>
    </OrderInfoCard>
  );
}
