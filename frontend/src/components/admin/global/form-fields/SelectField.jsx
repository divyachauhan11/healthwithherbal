import { FieldHint } from "./FieldHint";
import { FieldLabel } from "./FieldLabel";

const optionValue = (option) => (typeof option === "object" ? option.value : option);
const optionLabel = (option) => (typeof option === "object" ? option.label : option);

/**
 * `<select>` field of a FormModal schema. A current value missing from the
 * options is kept selectable as an extra option.
 * @param {object} props
 * @param {object} props.field Field config (label, options as values or {value, label}, placeholder, help, required, autoComplete).
 * @param {boolean} props.isWide Whether the field spans the full form width.
 * @param {*} props.value Current value.
 * @param {(value: string) => void} props.onChange Receives the selected value.
 */
export function SelectField({ field, isWide, value, onChange }) {
  return (
    <label className={isWide ? "wide" : ""}>
      <FieldLabel label={field.label} required={field.required} />
      <select
        required={field.required}
        autoComplete={field.autoComplete}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">
          {field.placeholder || "Select option"}
        </option>
        {(field.options || []).map((opt) => {
          const val = optionValue(opt);
          const lbl = optionLabel(opt);
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
        {value &&
          !field.options?.some((o) => optionValue(o) === value) && (
            <option value={value}>
              {value}
            </option>
          )}
      </select>
      {field.help && <FieldHint>{field.help}</FieldHint>}
    </label>
  );
}
