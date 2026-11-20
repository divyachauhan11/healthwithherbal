import { FieldHint } from "./FieldHint";
import { FieldLabel } from "./FieldLabel";

/**
 * Standard `<input>` field (text, number, date, tel, ...) of a FormModal schema.
 * @param {object} props
 * @param {object} props.field Field config (type, label, min/max, lengths, step, uppercase, help, ...).
 * @param {boolean} props.isWide Whether the field spans the full form width.
 * @param {*} props.value Current value.
 * @param {(value: string) => void} props.onChange Receives the new (optionally uppercased) value.
 */
export function TextInputField({ field, isWide, value, onChange }) {
  return (
    <label className={isWide ? "wide" : ""}>
      <FieldLabel label={field.label} required={field.required} />
      <input
        type={field.type || "text"}
        autoComplete={field.autoComplete}
        min={field.min}
        max={field.max}
        minLength={field.minLength}
        maxLength={field.maxLength}
        step={field.step}
        required={field.required}
        value={value ?? ""}
        onChange={(e) =>
          onChange(
            field.uppercase
              ? e.target.value.toUpperCase()
              : e.target.value,
          )
        }
        placeholder={field.placeholder || ""}
      />
      {field.help && <FieldHint>{field.help}</FieldHint>}
    </label>
  );
}
