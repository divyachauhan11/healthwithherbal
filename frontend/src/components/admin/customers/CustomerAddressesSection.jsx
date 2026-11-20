import { MapPin } from "lucide-react";
import { CustomerAddressCard } from "./CustomerAddressCard";
import { CustomerSectionHeading } from "./CustomerSectionHeading";

/**
 * "Saved addresses" section of the customer details dialog.
 * @param {{account: object, addresses: Array<object>}} props
 */
export function CustomerAddressesSection({ account, addresses }) {
  return (
    <section className="customer-addresses-section">
      <CustomerSectionHeading icon={MapPin} title="Saved addresses" count={addresses.length} countLabel={addresses.length === 1 ? "address" : "addresses"} />
      {addresses.length ? (
        <div className="customer-addresses-grid">
          {addresses.map((address) => (
            <CustomerAddressCard key={address._id} address={address} accountName={account.name} />
          ))}
        </div>
      ) : (
        <p className="customer-addresses-empty">This customer has not saved an address to their account.</p>
      )}
    </section>
  );
}
