import { UserFormField } from "./UserFormField";

/**
 * Password and confirmation fields of the staff account form, with a mismatch warning.
 * Passwords are required for new accounts and optional when editing.
 * @param {{form: object, isEditing: boolean, onFieldChange: (name: string, value: string) => void}} props
 */
export function UserPasswordFields({ form, isEditing, onFieldChange }) {
  return (
    <>
      <UserFormField label={isEditing ? "New password (optional)" : "Create password"}>
        <input required={!isEditing} type="password" minLength={8} maxLength={128} autoComplete="new-password" value={form.password} onChange={(event) => onFieldChange("password", event.target.value)} placeholder={isEditing ? "Leave blank to keep current password" : "At least 8 characters"} />
      </UserFormField>
      <UserFormField label="Confirm password">
        <input required={!isEditing || Boolean(form.password)} type="password" minLength={8} maxLength={128} autoComplete="new-password" value={form.confirmPassword} onChange={(event) => onFieldChange("confirmPassword", event.target.value)} placeholder="Re-enter password" />
      </UserFormField>
      {form.confirmPassword && form.password !== form.confirmPassword && (
        <p className="user-password-error" role="alert">Passwords do not match.</p>
      )}
    </>
  );
}
