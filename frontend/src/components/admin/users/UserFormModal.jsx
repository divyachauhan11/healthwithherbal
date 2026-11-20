import { Modal } from "@/components/admin/global";
import { UserAccountFields } from "./UserAccountFields";
import { UserPageAccessFieldset } from "./UserPageAccessFieldset";
import { UserPasswordFields } from "./UserPasswordFields";

/**
 * Add/edit staff account dialog: credentials, role, status and page access.
 * @param {{
 *   isOpen: boolean, busy: boolean, editingUser: object|null, form: object,
 *   onFieldChange: (name: string, value: *) => void, onRoleChange: (role: string) => void,
 *   onTogglePage: (pageName: string) => void, onClose: () => void, onSubmit: (event: Event) => void
 * }} props
 */
export function UserFormModal({
  isOpen,
  busy,
  editingUser,
  form,
  onFieldChange,
  onRoleChange,
  onTogglePage,
  onClose,
  onSubmit,
}) {
  return (
    <Modal
      isOpen={isOpen}
      title={editingUser ? "Edit user" : "Add new user"}
      subtitle="Manage login credentials, role, status, and page access."
      maxWidth="650px"
      onClose={onClose}
      onSubmit={onSubmit}
      busy={busy}
      submitLabel={editingUser ? "Save changes" : "Create user"}
    >
      <div className="form-grid">
        <UserAccountFields form={form} onFieldChange={onFieldChange} onRoleChange={onRoleChange} />
        <UserPasswordFields form={form} isEditing={Boolean(editingUser)} onFieldChange={onFieldChange} />
        <UserPageAccessFieldset role={form.role} pageAccess={form.pageAccess} onTogglePage={onTogglePage} />
      </div>
    </Modal>
  );
}
