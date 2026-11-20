import { UserFormField } from "./UserFormField";

/**
 * Name, email, role and status fields of the staff account form.
 * @param {{form: object, onFieldChange: (name: string, value: *) => void, onRoleChange: (role: string) => void}} props
 */
export function UserAccountFields({ form, onFieldChange, onRoleChange }) {
  return (
    <>
      <UserFormField label="Name">
        <input required minLength={2} maxLength={120} value={form.name} onChange={(event) => onFieldChange("name", event.target.value)} placeholder="Full name" />
      </UserFormField>
      <UserFormField label="Email">
        <input required type="email" maxLength={254} value={form.email} onChange={(event) => onFieldChange("email", event.target.value)} placeholder="name@example.com" />
      </UserFormField>
      <UserFormField label="Role">
        <select value={form.role} onChange={(event) => onRoleChange(event.target.value)}>
          <option value="admin">Admin</option>
          <option value="employee">Employee</option>
        </select>
      </UserFormField>
      <UserFormField label="Status">
        <select value={form.isActive ? "active" : "disabled"} onChange={(event) => onFieldChange("isActive", event.target.value === "active")}>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
      </UserFormField>
    </>
  );
}
