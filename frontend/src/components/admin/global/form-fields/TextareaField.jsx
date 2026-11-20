import { FieldHint } from "./FieldHint";
import { FieldLabel } from "./FieldLabel";

/**
 * Multi-line `<textarea>` field of a FormModal schema.
 * @param {object} props
 * @param {object} props.field Field config (label, rows, lengths, placeholder, help, required).
 * @param {boolean} props.isWide Whether the field spans the full form width.
 * @param {string} [props.value] Current value.
 * @param {(value: string) => void} props.onChange Receives the new text.
 */
export function TextareaField({ field, isWide, value, onChange }) {
  return (
    <label className={isWide ? "wide" : ""}>
      <FieldLabel label={field.label} required={field.required} />
      <textarea
        rows={field.rows || 3}
        required={field.required}
        minLength={field.minLength}
        maxLength={field.maxLength}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder || ""}
      />
      {field.help && <FieldHint>{field.help}</FieldHint>}
    </label>
  );
}
