import { CheckCircle2 } from "lucide-react";
import { AddressCardActions } from "./AddressCardActions";

/**
 * Saved address card with tag, default badge, recipient, address lines,
 * phone and edit/delete actions.
 * @param {object} props
 * @param {object} props.address Saved address.
 * @param {(address: object) => void} props.onEdit Opens the edit form.
 * @param {(address: object) => void} props.onDelete Asks to delete the address.
 */
export function AccountAddressCard({ address, onEdit, onDelete }) {
  return (
    <div className={`account-address-card ${address.isDefault ? "is-default" : ""}`}>
      <div className="address-card-header">
        <span className="address-tag-pill">{address.tag || "Home"}</span>
        {address.isDefault && (
          <span className="address-default-badge">
            <CheckCircle2 size={13} /> Default
          </span>
        )}
      </div>

      <div className="address-recipient">{address.fullName}</div>
      <div className="address-lines">
        {address.line1}{address.line2 ? `, ${address.line2}` : ""}, <br />
        {address.city}, {address.state ? `${address.state} - ` : ""}
        {address.postalCode}<br />
        {address.country || "India"}
      </div>
      <div className="address-phone">Phone: {address.phone}</div>

      <AddressCardActions
        onEdit={() => onEdit(address)}
        onDelete={() => onDelete(address)}
      />
    </div>
  );
}
