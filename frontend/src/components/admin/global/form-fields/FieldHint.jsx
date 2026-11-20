/**
 * Helper text shown under a form field.
 * @param {{children: import("react").ReactNode}} props
 */
export function FieldHint({ children }) {
  return <small className="field-hint">{children}</small>;
}
