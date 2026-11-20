import { Plus } from "lucide-react";
import { AccountAddressList } from "./AccountAddressList";
import { AccountLoadingState } from "./AccountLoadingState";
import { AccountPageHeader } from "./AccountPageHeader";
import { AddressFormModal } from "./AddressFormModal";
import { NoSavedAddresses } from "./NoSavedAddresses";

/**
 * "My Addresses" tab of the account page: saved address cards (or a
 * loading/empty state) and the add/edit address dialog.
 * @param {object} props
 * @param {object[]} props.addresses Saved addresses.
 * @param {boolean} props.loading Addresses are loading.
 * @param {object|null} props.currentUser Signed-in customer.
 * @param {object} props.addressBook State and handlers from `useAddressBook`.
 */
export function AccountAddressesTab({ addresses, loading, currentUser, addressBook }) {
  return (
    <div className="account-tab-content">
      <AccountPageHeader
        title="My Addresses"
        description="Manage your delivery addresses for seamless checkout."
      >
        <button
          type="button"
          className="app-button add-address-btn"
          onClick={addressBook.openAddAddress}
        >
          <Plus size={16} /> Add New Address
        </button>
      </AccountPageHeader>

      {/* Addresses List */}
      {loading ? (
        <AccountLoadingState message="Loading saved addresses from database..." />
      ) : addresses.length === 0 ? (
        <NoSavedAddresses onAddAddress={addressBook.openAddAddress} />
      ) : (
        <AccountAddressList
          addresses={addresses}
          onEdit={addressBook.openEditAddress}
          onDelete={addressBook.setAddressToDelete}
        />
      )}

      {/* Add / Edit Address Pop-up Modal (Powered by FormModal & Modal) */}
      <AddressFormModal
        isOpen={addressBook.showAddAddress}
        address={addressBook.editingAddress}
        currentUser={currentUser}
        isFirstAddress={addresses.length === 0}
        busy={addressBook.savingAddress}
        onSave={addressBook.saveAddress}
        onClose={addressBook.closeAddressForm}
      />
    </div>
  );
}
