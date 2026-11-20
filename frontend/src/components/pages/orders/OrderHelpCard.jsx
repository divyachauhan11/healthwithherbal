import { Clock } from "lucide-react";

/**
 * Support card telling the customer how to reach the care team about the order.
 * @param {object} props
 * @param {string} [props.orderNumber] Order reference to quote.
 */
export function OrderHelpCard({ orderNumber }) {
  return (
    <div className="order-guarantee-card">
      <Clock size={16} color="var(--forest)" />
      <div>
        <strong>Questions or changes?</strong>
        <p>
          Email us at <em>care@healthwithherbal.com</em> with your order
          reference <strong>{orderNumber}</strong>.
        </p>
      </div>
    </div>
  );
}
