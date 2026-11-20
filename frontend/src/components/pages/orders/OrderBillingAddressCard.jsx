import { FileText } from "lucide-react";
import { OrderInfoCard } from "./OrderInfoCard";

/**
 * "Billing Address" card: name and address lines.
 * @param {object} props
 * @param {object} props.address Billing address with `firstName`, `lastName`,
 *   `street`, `city`, `postalCode`, `country`.
 */
export function OrderBillingAddressCard({ address }) {
  return (
    <OrderInfoCard icon={FileText} title="Billing Address">
      <div className="recipient-name">
        {address.firstName}{" "}
        {address.lastName}
      </div>
      <p className="address-lines">
        {address.street}
        <br />
        {address.city},{" "}
        {address.postalCode}
        <br />
        {address.country || "India"}
      </p>
    </OrderInfoCard>
  );
}
