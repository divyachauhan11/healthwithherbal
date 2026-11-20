import { Phone } from "lucide-react";
import { formatCustomerAddress } from "./customer-utils";

/**
 * One saved address of a customer, with its tag, default/type labels and contact.
 * @param {{address: object, accountName?: string}} props `accountName` is used when the address has no name.
 */
export function CustomerAddressCard({ address, accountName }) {
  return (
    <article className="customer-address-card">
      <div className="customer-address-card-heading">
        <strong>{address.tag || "Address"}</strong>
        <div>
          {address.isDefault && <span className="customer-address-default">Default</span>}
          <span className="customer-address-type">{address.type || "shipping"}</span>
        </div>
      </div>
      <b>{address.fullName || accountName}</b>
      {address.phone && <span className="customer-address-phone"><Phone size={13} /> {address.phone}</span>}
      <p>{formatCustomerAddress(address)}</p>
    </article>
  );
}
