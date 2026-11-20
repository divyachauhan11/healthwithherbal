import { FormField } from "@/components/shared/FormField";

/**
 * Labelled field of the staff account form.
 * @param {{label: import("react").ReactNode, children: import("react").ReactNode}} props
 */
export function UserFormField({ label, children }) {
  return (
    <FormField variant="admin-form" label={<span className="field-label">{label}</span>}>
      {children}
    </FormField>
  );
}
