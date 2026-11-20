import { savedAddressLines } from "./checkout-utils";

/**
 * Selectable saved-address card with radio, tag, address lines, phone and
 * remove/edit actions.
 * @param {object} props
 * @param {object} props.address Saved address.
 * @param {boolean} props.selected Whether this address is selected.
 * @param {boolean} [props.isDefault] Marks the default address card.
 * @param {() => void} props.onSelect Selects the address.
 * @param {() => void} props.onEdit Opens the address for editing.
 * @param {() => void} props.onRemove Asks to remove the address.
 */
export function CheckoutAddressCard({
  address,
  selected,
  isDefault,
  onSelect,
  onEdit,
  onRemove,
}) {
  const { addressLine1, addressLine2 } = savedAddressLines(address);

  return (
    <article
      className={`checkout-address-choice ${selected ? "selected" : ""} ${isDefault ? "is-default" : ""}`}
      onClick={onSelect}
    >
      <div className="checkout-address-choice-top">
        <label
          className="checkout-address-choice-select"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.();
          }}
        >
          <span
            className={`checkout-custom-radio ${selected ? "checked" : ""}`}
          >
            <input
              type="radio"
              name="deliveryAddress"
              checked={selected}
              onChange={onSelect}
              className="checkout-address-native-radio"
            />
            <span className="checkout-radio-circle">
              <span className="checkout-radio-dot" />
            </span>
          </span>
          <strong className="checkout-address-recipient">
            {address.fullName}
          </strong>
          <span className="checkout-address-choice-tag">
            {(address.tag || "HOME").toUpperCase()}
          </span>
        </label>
      </div>

      <div className="checkout-address-body">
        <div className="checkout-address-text">
          <div>{addressLine1}</div>
          {addressLine2 && <div>{addressLine2}</div>}
        </div>

        {address.phone && (
          <div className="checkout-address-phone-row">
            Mobile: <strong>{address.phone}</strong>
          </div>
        )}

        <div className="checkout-address-cod-row">
          <span className="checkout-cod-bullet">•</span> Pay on Delivery
          available
        </div>

        <div className="checkout-address-actions">
          <button
            type="button"
            className="checkout-address-btn checkout-address-btn-remove"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
          >
            REMOVE
          </button>
          <button
            type="button"
            className="checkout-address-btn checkout-address-btn-edit"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
          >
            EDIT
          </button>
        </div>
      </div>
    </article>
  );
}
