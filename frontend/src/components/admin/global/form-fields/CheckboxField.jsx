/**
 * Full-width checkbox field of a FormModal schema.
 * @param {object} props
 * @param {object} props.field Field config (label).
 * @param {*} props.value Current value (truthy = checked).
 * @param {(checked: boolean) => void} props.onChange Receives the new checked state.
 */
export function CheckboxField({ field, value, onChange }) {
  return (
    <label className="admin-checkbox wide">
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
      />{" "}
      <b>{field.label}</b>
    </label>
  );
}
