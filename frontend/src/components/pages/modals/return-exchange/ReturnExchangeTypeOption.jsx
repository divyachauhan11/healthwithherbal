/**
 * One radio choice of the return/exchange request type.
 * @param {object} props
 * @param {string} props.value Request type value.
 * @param {string} props.label Choice label.
 * @param {boolean} props.checked Choice is selected.
 * @param {() => void} props.onSelect Selects this request type.
 */
export function ReturnExchangeTypeOption({ value, label, checked, onSelect }) {
  return (
    <label>
      <input
        type="radio"
        name="requestType"
        value={value}
        checked={checked}
        onChange={onSelect}
      />
      <span>{label}</span>
    </label>
  );
}
