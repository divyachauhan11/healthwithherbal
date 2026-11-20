import { useMemo } from "react";
import { FormModal } from "@/components/admin/global/FormModal";
import { newAddressDefaults } from "./account-utils";

/**
 * Add / edit saved-address dialog (the shared `FormModal` address form).
 * Without `address` it opens with the customer's name and phone prefilled.
 * @param {object} props
 * @param {boolean} props.isOpen Dialog is open.
 * @param {object|null} props.address Address being edited, or null to add one.
 * @param {object|null} props.currentUser Signed-in customer.
 * @param {boolean} props.isFirstAddress No address saved yet (new address defaults to default).
 * @param {boolean} props.busy Save in progress.
 * @param {(formData: object) => void} props.onSave Saves the form values.
 * @param {() => void} props.onClose Closes the dialog.
 */
export function AddressFormModal({ isOpen, address, currentUser, isFirstAddress, busy, onSave, onClose }) {
  // FormModal re-syncs its fields whenever `initial` changes, so the "add"
  // defaults must keep their identity while the dialog is open; a new object
  // per render wiped the customer's input on every re-render (e.g. a failed save).
  const initial = useMemo(
    () => address || newAddressDefaults(currentUser, isFirstAddress),
    [address, currentUser, isFirstAddress],
  );

  return (
    <FormModal
      entity="address"
      isOpen={isOpen}
      initial={initial}
      onSave={onSave}
      onClose={onClose}
      busy={busy}
      submitLabel={address ? "Save Changes" : "Save Address"}
      className="checkout-address-form-modal address-modal-popup"
    />
  );
}
