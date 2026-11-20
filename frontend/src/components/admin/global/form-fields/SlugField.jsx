import { FieldLabel } from "./FieldLabel";

/**
 * URL slug input of a FormModal schema; `{slug}` in the help text previews the value.
 * @param {object} props
 * @param {object} props.field Field config (label, placeholder, help, required).
 * @param {boolean} props.isWide Whether the field spans the full form width.
 * @param {string} [props.value] Current slug.
 * @param {(rawValue: string) => void} props.onChange Receives the raw typed text.
 */
export function SlugField({ field, isWide, value, onChange }) {
  return (
    <label className={isWide ? "wide" : ""}>
      <FieldLabel label={field.label} required={field.required} />
      <input
        required={field.required}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder || ""}
      />
      {field.help && (
        <small
          style={{
            fontSize: "11px",
            color: "#78857f",
            marginTop: "3px",
            display: "block",
          }}
        >
          {field.help.replace("{slug}", value || "slug")}
        </small>
      )}
    </label>
  );
}
