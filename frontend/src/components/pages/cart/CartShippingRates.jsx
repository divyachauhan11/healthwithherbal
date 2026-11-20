import { shippingMethodForRate, shippingOptionFromRate } from "./cart-utils";
import { CartShippingRateOption } from "./CartShippingRateOption";

/**
 * Delivery options returned by the shipping estimate.
 * @param {object} props
 * @param {object[]} props.rates Estimated rates.
 * @param {string} props.country Destination country (decides the method keys).
 * @param {string} props.selectedMethod Currently selected shipping method.
 * @param {(option: object) => void} props.onSelect Selects a shipping option.
 */
export function CartShippingRates({ rates, country, selectedMethod, onSelect }) {
  return (
    <fieldset className="cart-shipping-options" role="radiogroup">
      <legend>Choose delivery option</legend>
      {rates.map((rate) => {
        const method = shippingMethodForRate(rate, country);
        return (
          <CartShippingRateOption
            key={method}
            rate={rate}
            selected={selectedMethod === method}
            onSelect={() => {
              onSelect(shippingOptionFromRate(rate, method));
            }}
          />
        );
      })}
    </fieldset>
  );
}
