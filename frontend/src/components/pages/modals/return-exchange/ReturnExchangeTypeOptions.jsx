import { RETURN_EXCHANGE_TYPES } from "@/constants/statuses";
import { ReturnExchangeTypeOption } from "./ReturnExchangeTypeOption";

/**
 * "What would you like to request?" choice between a return and an exchange.
 * @param {object} props
 * @param {string} props.value Selected request type.
 * @param {(type: string) => void} props.onChange Selects a request type.
 */
export function ReturnExchangeTypeOptions({ value, onChange }) {
  return (
    <fieldset className="return-exchange-options">
      <legend>What would you like to request?</legend>
      <ReturnExchangeTypeOption
        value={RETURN_EXCHANGE_TYPES[0]}
        label="Return for refund"
        checked={value === RETURN_EXCHANGE_TYPES[0]}
        onSelect={() => onChange(RETURN_EXCHANGE_TYPES[0])}
      />
      <ReturnExchangeTypeOption
        value={RETURN_EXCHANGE_TYPES[1]}
        label="Exchange (subject to confirmation)"
        checked={value === RETURN_EXCHANGE_TYPES[1]}
        onSelect={() => onChange(RETURN_EXCHANGE_TYPES[1])}
      />
    </fieldset>
  );
}
