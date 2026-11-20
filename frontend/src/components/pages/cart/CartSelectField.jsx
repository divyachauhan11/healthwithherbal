/**
 * Labelled select used by the shipping estimator (one option per value).
 * @param {object} props
 * @param {string} props.label Field label.
 * @param {string} props.value Selected value.
 * @param {string[]} props.options Option values (also used as labels).
 * @param {(value: string) => void} props.onChange Called with the new value.
 */
export function CartSelectField({ label, value, options, onChange }) {
  return (
    <div className="cart-form-group">
      <label className="cart-submodal-label">{label}</label>
      <select
        className="cart-submodal-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
