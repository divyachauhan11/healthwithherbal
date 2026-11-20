"use client";
import { useState } from "react";
import { deleteUserAddress, saveUserAddress, updateUserAddress } from "@/lib/api";
import { buildAddressPayload, hasRequiredAddressFields } from "./account-utils";

/**
 * Saved-address management for the account page: the add/edit form dialog,
 * saving through the API, and the delete confirmation.
 * @param {object} options
 * @param {object|null} options.currentUser Signed-in customer.
 * @param {object[]} options.addresses Saved addresses (from `useAccountData`).
 * @param {Function} options.setAddresses Setter for `addresses`.
 * @param {(message: string) => void} [options.notify] Toast notifier.
 * @returns {{
 *   showAddAddress: boolean, editingAddress: object|null, savingAddress: boolean,
 *   openAddAddress: () => void, openEditAddress: (address: object) => void,
 *   closeAddressForm: () => void, saveAddress: (formData: object) => Promise<void>,
 *   addressToDelete: object|null, setAddressToDelete: Function,
 *   deletingAddress: boolean, confirmDeleteAddress: () => Promise<void>,
 * }}
 */
export function useAddressBook({ currentUser, addresses, setAddresses, notify }) {
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [deletingAddress, setDeletingAddress] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);

  const openAddAddress = () => {
    setEditingAddress(null);
    setShowAddAddress(true);
  };

  const openEditAddress = (addr) => {
    setEditingAddress(addr);
    setShowAddAddress(true);
  };

  const closeAddressForm = () => {
    setShowAddAddress(false);
    setEditingAddress(null);
  };

  // Handle saving new or updated address via modal
  const saveAddress = async (formData) => {
    if (!hasRequiredAddressFields(formData)) {
      if (notify) notify("Please fill all required address fields.");
      return;
    }

    setSavingAddress(true);
    try {
      const payload = buildAddressPayload(formData, currentUser);

      if (editingAddress?._id) {
        const updated = await updateUserAddress(editingAddress._id, payload);
        setAddresses((prev) =>
          prev.map((a) => (a._id === updated._id ? updated : a)),
        );
        if (notify) notify("Address updated successfully!");
      } else {
        const newAddr = await saveUserAddress({
          ...payload,
          isDefault: payload.isDefault ?? addresses.length === 0,
        });
        setAddresses((prev) => [newAddr, ...prev]);
        if (notify) notify("Address saved successfully!");
      }

      closeAddressForm();
    } catch (err) {
      if (notify) notify(err.message || "Failed to save address.");
    } finally {
      setSavingAddress(false);
    }
  };

  // Handle delete address
  const deleteAddress = async (id) => {
    try {
      await deleteUserAddress(id);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
      if (notify) notify("Address removed.");
    } catch (err) {
      if (notify) notify(err.message || "Could not delete address.");
    }
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete?._id) return;
    setDeletingAddress(true);
    try {
      await deleteAddress(addressToDelete._id);
      setAddressToDelete(null);
    } finally {
      setDeletingAddress(false);
    }
  };

  return {
    showAddAddress,
    editingAddress,
    savingAddress,
    openAddAddress,
    openEditAddress,
    closeAddressForm,
    saveAddress,
    addressToDelete,
    setAddressToDelete,
    deletingAddress,
    confirmDeleteAddress,
  };
}
