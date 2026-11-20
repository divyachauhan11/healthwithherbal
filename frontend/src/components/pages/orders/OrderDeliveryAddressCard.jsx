import { MapPin } from "lucide-react";
import { OrderInfoCard } from "./OrderInfoCard";

/**
 * "Delivery Address" card: recipient, address lines and contact details.
 * @param {object} props
 * @param {object} props.address Shipping address (or customer) with
 *   `firstName`, `lastName`, `street`, `city`, `postalCode`, `country`, `phone`, `email`.
 */
export function OrderDeliveryAddressCard({ address }) {
  return (
    <OrderInfoCard icon={MapPin} title="Delivery Address">
      <div className="recipient-name">
        {address.firstName} {address.lastName}
      </div>
      <p className="address-lines">
        {address.street} <br />
        {address.city}, {address.postalCode} <br />
        {address.country || "India"}
      </p>
      {address.phone && (
        <div className="contact-row">
          <span>Phone:</span> <strong>{address.phone}</strong>
        </div>
      )}
      {address.email && (
        <div className="contact-row">
          <span>Email:</span> <strong>{address.email}</strong>
        </div>
      )}
    </OrderInfoCard>
  );
}
