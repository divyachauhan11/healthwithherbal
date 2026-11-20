"use client";

import { SearchField } from "@/components/admin/global";
import { UserTable } from "@/components/admin/tables";
import { UserFormModal, useUserForm } from "@/components/admin/users";

/**
 * Users page: searchable staff account table and the add/edit account dialog. The dialog's
 * open state is owned by the portal (`isOpen`, `onOpen`, `onClose`).
 */
export default function UsersPage({ rows = [], query, setQuery, onCreateUser, onUpdateUser, onDeleteUser, currentUser, busy = false, isOpen = false, onOpen, onClose }) {
  const {
    editingUser,
    form,
    setField,
    updateRole,
    togglePage,
    submit,
    editUser,
    closeModal,
  } = useUserForm({ busy, onCreateUser, onUpdateUser, onOpen, onClose });

  return (
    <>
      <section className="panel page-panel">
        <div className="page-tools">
          <SearchField value={query} onChange={setQuery} placeholder="Search users" />
          <p className="section-intro">Administrator and employee accounts with portal access.</p>
        </div>
        <UserTable
          rows={rows}
          onEdit={editUser}
          onDelete={onDeleteUser}
          currentUserId={currentUser?._id || currentUser?.id}
          currentUserEmail={currentUser?.email}
        />
      </section>

      <UserFormModal
        isOpen={isOpen}
        busy={busy}
        editingUser={editingUser}
        form={form}
        onFieldChange={setField}
        onRoleChange={updateRole}
        onTogglePage={togglePage}
        onClose={closeModal}
        onSubmit={submit}
      />
    </>
  );
}
