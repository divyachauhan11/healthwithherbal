import { AccountAddressCard } from "./AccountAddressCard";

/**
 * Grid of the customer's saved address cards.
 * @param {object} props
 * @param {object[]} props.addresses Saved addresses.
 * @param {(address: object) => void} props.onEdit Opens the edit form for an address.
 * @param {(address: object) => void} props.onDelete Asks to delete an address.
 */
export function AccountAddressList({ addresses, onEdit, onDelete }) {
  return (
    <div className="account-addresses-grid">
      {addresses.map((addr) => (
        <AccountAddressCard
          key={addr._id}
          address={addr}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
