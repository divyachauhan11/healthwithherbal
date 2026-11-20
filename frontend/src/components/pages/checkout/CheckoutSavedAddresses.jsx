import { CheckoutAddressCard } from "./CheckoutAddressCard";

/**
 * Saved address groups: the default address, other addresses and an
 * "+ Add New Address" card.
 * @param {object} props
 * @param {object} props.defaultAddress Default (or first) saved address.
 * @param {object[]} props.otherAddresses Remaining saved addresses.
 * @param {string|null} props.selectedAddressId Selected address ID.
 * @param {() => void} props.onAddAddress Opens the add-address modal.
 * @param {(address: object) => void} props.onSelectAddress Selects an address.
 * @param {(address: object) => void} props.onEditAddress Edits an address.
 * @param {(address: object) => void} props.onRemoveAddress Asks to remove an address.
 */
export function CheckoutSavedAddresses({
  defaultAddress,
  otherAddresses,
  selectedAddressId,
  onAddAddress,
  onSelectAddress,
  onEditAddress,
  onRemoveAddress,
}) {
  return (
    <>
      <h3 className="checkout-address-group-title">
        Default Address
      </h3>
      <CheckoutAddressCard
        address={defaultAddress}
        selected={selectedAddressId === defaultAddress._id}
        isDefault
        onSelect={() => onSelectAddress(defaultAddress)}
        onEdit={() => onEditAddress(defaultAddress)}
        onRemove={() => onRemoveAddress(defaultAddress)}
      />

      {otherAddresses.length > 0 && (
        <>
          <h3 className="checkout-address-group-title">
            Other Addresses
          </h3>
          <div className="checkout-address-list">
            {otherAddresses.map((address) => (
              <CheckoutAddressCard
                key={address._id}
                address={address}
                selected={selectedAddressId === address._id}
                onSelect={() => onSelectAddress(address)}
                onEdit={() => onEditAddress(address)}
                onRemove={() => onRemoveAddress(address)}
              />
            ))}
          </div>
        </>
      )}

      <button
        type="button"
        className="checkout-add-address-card"
        onClick={onAddAddress}
      >
        + Add New Address
      </button>
    </>
  );
}
