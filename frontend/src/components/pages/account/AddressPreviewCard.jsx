import { CheckCircle2 } from "lucide-react";

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
