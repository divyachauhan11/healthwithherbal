import { FormModal } from "@/components/admin/global/FormModal";

/**
 * Add/edit delivery address modal (the shared address `FormModal`) with the
 * address error shown inside it.
 * @param {object} props
 * @param {boolean} props.isOpen Whether the modal is open.
 * @param {boolean} props.isEditing Editing an existing address (vs adding one).
 * @param {object} props.initial Initial form values.
 * @param {boolean} props.busy Saving is in progress.
 * @param {string} props.error Address error message.
 * @param {(values: object) => void} props.onSave Saves the address.
 * @param {() => void} props.onClose Closes the modal.
 */
export function CheckoutAddressFormModal({
  isOpen,
  isEditing,
  initial,
  busy,
  error,
  onSave,
  onClose,
}) {
  return (
    <FormModal
      entity="address"
      isOpen={isOpen}
      initial={initial}
      title={isEditing ? "Edit Address" : "Add New Address"}
      subtitle="Enter the details for your delivery address."
      className="checkout-address-form-modal address-modal-popup"
      onSave={onSave}
      onClose={onClose}
      busy={busy}
      submitLabel={isEditing ? "Save Changes" : "Save Address"}
    >
      {error && (
        <p role="alert" className="checkout-error wide">
          {error}
        </p>
      )}
    </FormModal>
  );
}
