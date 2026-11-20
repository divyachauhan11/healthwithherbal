/**
 * Labelled date input used for the "requested from/to" filters.
 * @param {{label: string, value: string, onChange: (value: string) => void}} props
 */
export function ReturnDateFilter({ label, value, onChange }) {
  return (
    <label>
      <span>{label}</span>
      <input type="date" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
