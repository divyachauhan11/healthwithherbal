"use client";

import { useState } from "react";
import { createUserForm, getDefaultPageAccess, toUserPayload, userToForm } from "./user-utils";

/**
 * Owns the add/edit staff account form: the user being edited, field values, role-based
 * page access defaults and submission through the portal's create/update callbacks.
 * @param {{busy: boolean, onCreateUser?: Function, onUpdateUser?: Function, onOpen?: Function, onClose?: Function}} options
 * @returns {{
 *   editingUser: object|null, form: object, setField: (name: string, value: *) => void,
 *   updateRole: (role: string) => void, togglePage: (pageName: string) => void,
 *   submit: (event: Event) => Promise<void>, editUser: (user: object) => void, closeModal: () => void
 * }}
 */
export function useUserForm({ busy, onCreateUser, onUpdateUser, onOpen, onClose }) {
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(createUserForm);

  const setField = (name, value) => setForm({ ...form, [name]: value });
  const updateRole = (role) => setForm((current) => ({
    ...current,
    role,
    pageAccess: getDefaultPageAccess(role),
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
    const userData = toUserPayload(form, Boolean(editingUser));
    const saved = editingUser
      ? await onUpdateUser?.(editingUser._id, userData)
      : await onCreateUser?.(userData);
    if (saved) {
      setEditingUser(null);
      onClose?.();
      setForm(createUserForm());
    }
  };
  const editUser = (user) => {
    setEditingUser(user);
    setForm(userToForm(user));
    onOpen?.();
  };
  const closeModal = () => {
    if (busy) return;
    setEditingUser(null);
    setForm(createUserForm());
    onClose?.();
  };

  return { editingUser, form, setField, updateRole, togglePage, submit, editUser, closeModal };
}
