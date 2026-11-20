import { CheckCircle2 } from "lucide-react";

/**
 * Compact card of the default address on the account overview (nothing without an address).
 * @param {object} props
 * @param {object} [props.address] Saved address.
 */
export function AddressPreviewCard({ address }) {
  if (!address) return null;

  return (
    <div className="account-address-card default-addr-preview">
      <div className="address-card-header">
        <span className="address-tag-pill">{address.tag || "Home"}</span>
        {address.isDefault && (
          <span className="address-default-badge">
            <CheckCircle2 size={13} /> Default Delivery Address
          </span>
        )}
      </div>
      <div className="address-recipient">{address.fullName}</div>
      <div className="address-lines">
        {address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state || ""} - {address.postalCode}
      </div>
      <div className="address-phone">Phone: {address.phone}</div>
    </div>
  );
}
