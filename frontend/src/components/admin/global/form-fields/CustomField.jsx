/**
 * Wrapper for a schema field that renders itself through `field.render`.
 * @param {object} props
 * @param {object} props.field Field config with `render({value, onChange, form, update})`, optional `style`.
 * @param {boolean} props.isWide Whether the field spans the full form width.
 * @param {*} props.value Current value.
 * @param {(value: *) => void} props.onChange Updates this field.
 * @param {object} props.form All current form values.
 * @param {(name: string, value: *) => void} props.update Updates any field by name.
 */
export function CustomField({ field, isWide, value, onChange, form, update }) {
  return (
    <div
      className={isWide ? "wide" : ""}
      style={field.style}
    >
      {field.render({
        value,
        onChange,
        form,
        update,
      })}
    </div>
  );
}
