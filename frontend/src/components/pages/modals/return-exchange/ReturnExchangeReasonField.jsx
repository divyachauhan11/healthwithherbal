/**
 * Optional free-text reason of the return/exchange request.
 * @param {object} props
 * @param {string} props.value Reason text.
 * @param {(value: string) => void} props.onChange
 */
export function ReturnExchangeReasonField({ value, onChange }) {
  return (
    <label className="return-exchange-field">
      Reason (optional)
      <textarea
        rows={4}
        maxLength={1000}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Tell us how we can help"
      />
    </label>
  );
}
