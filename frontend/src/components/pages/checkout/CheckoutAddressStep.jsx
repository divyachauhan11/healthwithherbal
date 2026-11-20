import { Loader2 } from "lucide-react";
import { CheckoutSavedAddresses } from "./CheckoutSavedAddresses";

/**
 * Address step: "Select Delivery Address" section with loading, saved
 * address groups, an empty message and the address error.
 * @param {object} props
 * @param {boolean} props.loading Saved addresses are loading.
 * @param {object|undefined} props.defaultAddress Default (or first) saved address.
 * @param {object[]} props.otherAddresses Remaining saved addresses.
 * @param {string|null} props.selectedAddressId Selected address ID.
 * @param {string} props.error Address load/save/remove error.
 * @param {() => void} props.onAddAddress Opens the add-address modal.
 * @param {(address: object) => void} props.onSelectAddress Selects an address.
 * @param {(address: object) => void} props.onEditAddress Edits an address.
 * @param {(address: object) => void} props.onRemoveAddress Asks to remove an address.
 */
export function CheckoutAddressStep({
  loading,
  defaultAddress,
  otherAddresses,
  selectedAddressId,
  error,
  onAddAddress,
  onSelectAddress,
  onEditAddress,
  onRemoveAddress,
}) {
  return (
    <section
      className="checkout-address-section"
      aria-labelledby="delivery-address-title"
    >
      <div className="checkout-address-section-header">
        <h2 id="delivery-address-title">Select Delivery Address</h2>
        <button type="button" onClick={onAddAddress}>
          Add New Address
        </button>
      </div>

      {loading && (
        <div className="checkout-address-loading">
          <Loader2 size={16} className="spin-animate" />
          <span>Loading saved addresses…</span>
        </div>
      )}

      {!loading && defaultAddress && (
        <CheckoutSavedAddresses
          defaultAddress={defaultAddress}
          otherAddresses={otherAddresses}
          selectedAddressId={selectedAddressId}
          onAddAddress={onAddAddress}
          onSelectAddress={onSelectAddress}
          onEditAddress={onEditAddress}
          onRemoveAddress={onRemoveAddress}
        />
      )}

      {!loading && !defaultAddress && (
        <p className="checkout-no-addresses">
          Add a delivery address to continue.
        </p>
      )}

      {error && (
        <p role="alert" className="checkout-error">
          {error}
        </p>
      )}
    </section>
  );
}
