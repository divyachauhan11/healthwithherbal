"use client";

import { useState } from "react";
import {
  createAdminUser,
  saveAdminRecord,
  setAdminProductActive,
  updateAdminUser,
} from "../../../lib/admin-api";

/**
 * Owns the open record form (`{kind, item, ...}`) and the write actions of the
 * admin pages: save a record, create/update staff users and toggle product
 * visibility (optimistically), each reloading the affected page and showing a toast.
 * @param {object} options
 * @param {string} options.token Admin token.
 * @param {string} options.page Active page.
 * @param {(target?: string) => Promise<void>} options.load Reloads a page's data.
 * @param {Function} options.setData Setter of the loaded page data.
 * @param {(message: string, type?: string) => void} options.notify
 * @param {(busy: boolean) => void} options.setBusy Shared portal busy flag.
 * @returns {{
 *   form: object|null, setForm: Function, save: (body: object) => Promise<*>,
 *   createStaffUser: (body: object) => Promise<boolean>,
 *   updateStaffUser: (id: string, body: object) => Promise<boolean>,
 *   toggleProductActive: (product: object) => Promise<void>,
 * }}
 */
export function useAdminMutations({ token, page, load, setData, notify, setBusy }) {
  const [form, setForm] = useState(null);

  const save = async (body) => {
    setBusy(true);
    try {
      const kind = form.kind;
      const result = await saveAdminRecord(kind, form.item?._id, body, token);
      setForm(null);
      await load(page);
      notify(`${kind.slice(0, -1)} saved successfully.`);
      return result;
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const createStaffUser = async (body) => {
    setBusy(true);
    try {
      await createAdminUser(body, token);
      await load("Users");
      notify("User created successfully.");
      return true;
    } catch (error) {
      notify(error.message || "Could not create user.", "error");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const updateStaffUser = async (id, body) => {
    setBusy(true);
    try {
      await updateAdminUser(id, body, token);
      await load("Users");
      notify("User updated successfully.");
      return true;
    } catch (error) {
      notify(error.message || "Could not update user.", "error");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const toggleProductActive = async (product) => {
    if (!product?._id) return;
    const nextActive = product.active === false ? true : false;
    setData((prev) => {
      const currentList = prev[page];
      if (!Array.isArray(currentList)) return prev;
      return {
        ...prev,
        [page]: currentList.map((item) =>
          item._id === product._id ? { ...item, active: nextActive } : item,
        ),
      };
    });

    try {
      await setAdminProductActive(product._id, nextActive, token);
      notify(
        nextActive
          ? `"${product.title || "Product"}" is now unhidden and visible in the store.`
          : `"${product.title || "Product"}" has been paused and hidden from the store.`,
        "success",
      );
      await load(page);
    } catch (error) {
      await load(page);
      notify(error.message || "Failed to update product visibility.", "error");
    }
  };

  return {
    form,
    setForm,
    save,
    createStaffUser,
    updateStaffUser,
    toggleProductActive,
  };
}
