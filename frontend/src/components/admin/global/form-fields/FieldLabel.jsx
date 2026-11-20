import { RequiredMark } from "./RequiredMark";

/**
 * Field caption (`span.field-label`) with an optional required marker.
 * @param {{label: import("react").ReactNode, required?: boolean}} props
 */
export function FieldLabel({ label, required }) {
  return (
    <span className="field-label">
      {label}
      {required && <RequiredMark />}
    </span>
  );
}
