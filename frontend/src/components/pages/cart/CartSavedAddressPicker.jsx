import { formatAddressOneLine } from "./cart-utils";

/**
 * Saved-address selector of the shipping estimator (signed-in customers):
 * loading text, the address dropdown with details, or an empty/error message.
 * @param {object} props
 * @param {boolean} props.loading Addresses are loading.
 * @param {object[]} props.addresses Saved addresses.
 * @param {string} props.selectedId Selected address ID.
 * @param {object|undefined} props.selectedAddress Selected address.
 * @param {string} props.error Load error message.
 * @param {(id: string) => void} props.onSelect Selects an address by ID.
 */
export function CartSavedAddressPicker({
  loading,
  addresses,
  selectedId,
  selectedAddress,
  error,
  onSelect,
}) {
  return (
    <div className="cart-saved-address-panel">
      <label className="cart-submodal-label" htmlFor="cart-saved-address">Saved delivery address</label>
      {loading ? (
        <p className="cart-saved-address-state">Loading your saved addresses…</p>
      ) : addresses.length ? (
        <>
          <select
            id="cart-saved-address"
            className="cart-submodal-select"
            value={selectedId}
            onChange={(event) => onSelect(event.target.value)}
          >
            {addresses.map((address) => (
              <option key={address._id} value={address._id}>
                {address.tag || "Address"}{address.isDefault ? " · Default" : ""} — {address.fullName}
              </option>
            ))}
          </select>
          {selectedAddress && (
            <div className="cart-saved-address-details">
              <strong>{selectedAddress.fullName}</strong>
              {selectedAddress.phone && <span>{selectedAddress.phone}</span>}
              <span>
                {formatAddressOneLine(selectedAddress)}
              </span>
              <small>Country, province, and postal code are filled from this address.</small>
            </div>
          )}
        </>
      ) : (
        <p className="cart-saved-address-state">
          {error || "No saved addresses found. Enter your shipping details below."}
        </p>
      )}
    </div>
  );
}
