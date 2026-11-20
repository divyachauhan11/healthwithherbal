import { MarkdownEditor } from "../markdown-editor";
import { FieldHint } from "./FieldHint";
import { FieldLabel } from "./FieldLabel";

/**
 * Markdown article field: label, formatting editor with preview, and help text.
 * @param {object} props
 * @param {object} props.field Field config (label, required, min/max length, placeholder, help).
 * @param {boolean} props.isWide Whether the field spans the full form width.
 * @param {string} [props.value] Current markdown.
 * @param {(value: string) => void} props.onChange Receives the new markdown.
 */
export function MarkdownField({ field, isWide, value, onChange }) {
  return (
    <div className={`markdown-field ${isWide ? "wide" : ""}`}>
      <FieldLabel label={field.label} required={field.required} />
      <MarkdownEditor
        value={value || ""}
        onChange={onChange}
        required={field.required}
        minLength={field.minLength}
        maxLength={field.maxLength}
        placeholder={field.placeholder || "Write your article..."}
      />
      {field.help && <FieldHint>{field.help}</FieldHint>}
    </div>
  );
}
