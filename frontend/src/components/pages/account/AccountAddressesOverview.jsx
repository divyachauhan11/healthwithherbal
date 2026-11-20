import { AccountLoadingState } from "./AccountLoadingState";
import { AccountSection } from "./AccountSection";
import { AddressPreviewCard } from "./AddressPreviewCard";
import { NoSavedAddresses } from "./NoSavedAddresses";

/**
 * "Saved Addresses" section of the account overview: the first saved
 * address, a loading state or an empty state.
 * @param {object} props
 * @param {object[]} props.addresses Saved addresses.
 * @param {boolean} props.loading Addresses are loading.
 * @param {() => void} props.onManage Switches to the "My Address" tab.
 * @param {() => void} props.onAddAddress Opens the add-address form.
 */
export function AccountAddressesOverview({ addresses, loading, onManage, onAddAddress }) {
  return (
    <AccountSection
      title="Saved Addresses"
      actionLabel={addresses.length > 0 ? `Manage (${addresses.length}) →` : undefined}
      onAction={onManage}
      style={{ marginTop: "32px" }}
    >
      {loading ? (
        <AccountLoadingState message="Loading saved addresses..." size={24} />
      ) : addresses.length === 0 ? (
        <NoSavedAddresses
          title="No Address Saved Yet"
          description="Tap to add and shop faster"
          actionLabel="Add New Address Now"
          inlineAction
          style={{}}
          onAddAddress={onAddAddress}
        />
      ) : (
        <AddressPreviewCard address={addresses[0]} />
      )}
    </AccountSection>
  );
}
