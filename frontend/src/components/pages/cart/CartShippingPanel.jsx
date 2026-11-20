import { createPortal } from "react-dom";
import { ALL_INDIAN_STATES, COUNTRIES } from "./cart-utils";
import { CartSavedAddressPicker } from "./CartSavedAddressPicker";
import { CartSelectField } from "./CartSelectField";
import { CartShippingRates } from "./CartShippingRates";
import { CartSubmodal } from "./CartSubmodal";

/**
 * "Estimate shipping" panel, portalled to `document.body`: saved addresses
 * (signed-in customers), destination fields, the live estimate and the
 * delivery options it returns.
 * @param {object} props
 * @param {boolean} props.showSavedAddresses Whether to show the saved-address picker.
 * @param {ReturnType<import("./useCartShippingEstimate").useCartShippingEstimate>} props.estimate Shipping estimator state.
 * @param {string} props.selectedMethod Currently selected shipping method.
 * @param {(option: object) => void} props.onSelectShipping Selects a shipping option.
 * @param {() => void} props.onClose Closes the panel.
 */
export function CartShippingPanel({
  showSavedAddresses,
  estimate,
  selectedMethod,
  onSelectShipping,
  onClose,
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <CartSubmodal
      title="Estimate shipping"
      onClose={onClose}
      overlayClassName="cart-submodal-overlay cart-shipping-submodal-overlay"
      cardClassName="cart-submodal-card cart-shipping-submodal-card"
      onOverlayClick={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {showSavedAddresses && (
        <CartSavedAddressPicker
          loading={estimate.loadingAddresses}
          addresses={estimate.savedAddresses}
          selectedId={estimate.selectedAddressId}
          selectedAddress={estimate.selectedAddress}
          error={estimate.addressLoadError}
          onSelect={estimate.selectSavedAddress}
        />
      )}

      <CartSelectField
        label="Country"
        value={estimate.country}
        options={COUNTRIES}
        onChange={estimate.changeCountry}
      />

      {estimate.country === "India" && (
        <CartSelectField
          label="Province"
          value={estimate.province}
          options={ALL_INDIAN_STATES}
          onChange={estimate.changeProvince}
        />
      )}

      <div className="cart-form-group">
        <label className="cart-submodal-label">Zip/Postal Code</label>
        <input
          type="text"
          className="cart-submodal-input"
          value={estimate.zip}
          onChange={(e) => estimate.changeZip(e.target.value)}
          placeholder="345677"
        />
      </div>

      <button
        type="button"
        className="cart-submodal-btn"
        onClick={estimate.calculate}
        disabled={estimate.calculating}
      >
        {estimate.calculating ? "Calculating..." : "Calculate"}
      </button>

      {estimate.feedback && (
        <div
          className={`cart-shipping-alert ${estimate.feedback.type}`}
        >
          {estimate.feedback.text}
        </div>
      )}
      {estimate.rates.length > 0 && (
        <CartShippingRates
          rates={estimate.rates}
          country={estimate.country}
          selectedMethod={selectedMethod}
          onSelect={onSelectShipping}
        />
      )}
    </CartSubmodal>,
    document.body,
  );
}
