"use client";

import { useState } from "react";
import { SearchField, Modal } from "../../../../components/admin/global";
import { UserTable } from "../../../../components/admin/custom";

const employeePages = [
  "Products", "Categories", "Brands", "Coupons", "Reviews", "Orders", "Customers", "Blogs",
];
const allAdminPages = [
  "Dashboard", "Products", "Low Stock", "Categories", "Brands", "Orders",
  "Coupons", "Reviews", "Customers", "Blogs", "Users", "Settings", "Profile",
];

export default function UsersPage({ rows = [], query, setQuery, onCreateUser, onUpdateUser, onDeleteUser, busy = false, isOpen = false, onOpen, onClose }) {
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "employee",
    isActive: true,
    pageAccess: [...employeePages],
    password: "",
    confirmPassword: "",
  });

  const pages = allAdminPages;
  const updateRole = (role) => setForm((current) => ({
    ...current,
    role,
    pageAccess: role === "admin" ? [...allAdminPages] : [...employeePages],
  }));
  const togglePage = (pageName) => setForm((current) => ({
    ...current,
    pageAccess: current.pageAccess.includes(pageName)
      ? current.pageAccess.filter((page) => page !== pageName)
      : [...current.pageAccess, pageName],
  }));
  const submit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) return;
    const { confirmPassword, ...userData } = form;
    if (editingUser && !userData.password) delete userData.password;
    const saved = editingUser
      ? await onUpdateUser?.(editingUser._id, userData)
      : await onCreateUser?.(userData);
    if (saved) {
      setEditingUser(null);
      onClose?.();
      setForm({ name: "", email: "", role: "employee", isActive: true, pageAccess: [...employeePages], password: "", confirmPassword: "" });
    }
  };
  const editUser = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "employee",
      isActive: user.isActive !== false,
      pageAccess: user.pageAccess || (user.role === "admin" ? [...allAdminPages] : [...employeePages]),
      password: "",
      confirmPassword: "",
    });
    onOpen?.();
  };
  const closeModal = () => {
    if (busy) return;
    setEditingUser(null);
    setForm({ name: "", email: "", role: "employee", isActive: true, pageAccess: [...employeePages], password: "", confirmPassword: "" });
    onClose?.();
  };

  return (
    <>
      <section className="panel page-panel">
        <div className="page-tools">
          <SearchField value={query} onChange={setQuery} placeholder="Search users" />
          <p className="section-intro">Administrator and employee accounts with portal access.</p>
        </div>
        <UserTable rows={rows} onEdit={editUser} onDelete={onDeleteUser} />
      </section>

      <Modal
        isOpen={isOpen}
        title={editingUser ? "Edit user" : "Add new user"}
        subtitle="Manage login credentials, role, status, and page access."
        maxWidth="650px"
        onClose={closeModal}
        onSubmit={submit}
        busy={busy}
        submitLabel={editingUser ? "Save changes" : "Create user"}
      >
        <div className="form-grid">
          <label>
            <span className="field-label">Name</span>
            <input required minLength={2} maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Full name" />
          </label>
          <label>
            <span className="field-label">Email</span>
            <input required type="email" maxLength={254} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@example.com" />
          </label>
          <label>
            <span className="field-label">Role</span>
            <select value={form.role} onChange={(event) => updateRole(event.target.value)}>
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
            </select>
          </label>
          <label>
            <span className="field-label">Status</span>
            <select value={form.isActive ? "active" : "disabled"} onChange={(event) => setForm({ ...form, isActive: event.target.value === "active" })}>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </label>
          <label>
            <span className="field-label">{editingUser ? "New password (optional)" : "Create password"}</span>
            <input required={!editingUser} type="password" minLength={8} maxLength={128} autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder={editingUser ? "Leave blank to keep current password" : "At least 8 characters"} />
          </label>
          <label>
            <span className="field-label">Confirm password</span>
            <input required={!editingUser || Boolean(form.password)} type="password" minLength={8} maxLength={128} autoComplete="new-password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} placeholder="Re-enter password" />
          </label>
          {form.confirmPassword && form.password !== form.confirmPassword && (
            <p className="user-password-error" role="alert">Passwords do not match.</p>
          )}
          <fieldset className="user-access-list">
            <legend>Pages access</legend>
            <p>Choose which admin portal pages this user can access.</p>
            <div className="user-access-grid">
              {pages.map((pageName) => (
                <label key={pageName}>
                  <input
                    type="checkbox"
                    checked={form.pageAccess.includes(pageName)}
                    onChange={() => togglePage(pageName)}
                  />
                  <span>{pageName}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </Modal>
    </>
  );
}
