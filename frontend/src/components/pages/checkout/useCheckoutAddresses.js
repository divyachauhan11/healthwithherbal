"use client";
import { useEffect, useMemo, useState } from "react";
import {
  deleteUserAddress,
  fetchUserAddresses,
  saveUserAddress,
  updateUserAddress,
} from "@/lib/api";
import {
  addressModalValues,
  addressToFormData,
  newAddressFormData,
  requiredAddressFields,
  splitFullName,
  toAddressPayload,
  uniqueAddresses,
} from "./checkout-utils";

/**
 * Checkout delivery-address state: the customer's saved addresses (loaded
 * when `currentUser` changes), the selected address mirrored into the order
 * form data, and the add/edit modal and remove confirmation flows.
 * @param {object} options
 * @param {object|null} options.currentUser Signed-in customer.
 * @returns {{
 *   savedAddresses: object[], defaultAddress: object|undefined, otherAddresses: object[],
 *   selectedAddressId: string|null, loadingAddresses: boolean, addressError: string,
 *   formData: object,
 *   isAddressModalOpen: boolean, editingAddressId: string|null, addressModalInitial: object,
 *   savingAddress: boolean, addressToDelete: object|null, deletingAddress: boolean,
 *   selectAddress: (address: object) => void, editAddress: (address: object) => void,
 *   startNewAddress: () => void, closeAddressModal: () => void,
 *   saveAddress: (values: object) => Promise<void>,
 *   requestRemoveAddress: (address: object) => void, cancelRemoveAddress: () => void,
 *   confirmRemoveAddress: () => Promise<void>,
 * }}
 */
export function useCheckoutAddresses({ currentUser }) {
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [deletingAddress, setDeletingAddress] = useState(false);

  // Delivery details used for the order payload.
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  const applyAddressToForm = (addr) => {
    if (!addr) return;
    setFormData(addressToFormData(addr, currentUser));
  };

  useEffect(() => {
    if (!currentUser) return;

    let active = true;
    setLoadingAddresses(true);

    fetchUserAddresses({
      phone: currentUser.phone || "",
      email: currentUser.email || "",
      userId: currentUser._id || "",
    })
      .then((addrs) => {
        if (!active) return;
        const list = uniqueAddresses(Array.isArray(addrs) ? addrs : []);
        setSavedAddresses(list);

        if (list.length > 0) {
          // Select the default address (or the first one).
          const def = list.find((a) => a.isDefault) || list[0];
          setSelectedAddressId(def._id);
          setFormData(addressToFormData(def, currentUser));
        } else {
          setSelectedAddressId(null);
          // No saved addresses yet: pre-fill the customer's contact details.
          setFormData((prev) => ({
            ...prev,
            ...splitFullName(currentUser.name),
            email: currentUser.email || "",
            phone: currentUser.phone || "",
          }));
        }
      })
      .catch((err) => {
        console.error("Failed to load saved addresses for checkout:", err);
        if (active)
          setAddressError(err.message || "Could not load saved addresses.");
      })
      .finally(() => {
        if (active) setLoadingAddresses(false);
      });

    return () => {
      active = false;
    };
  }, [currentUser]);

  const selectAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setEditingAddressId(null);
    setIsAddressModalOpen(false);
    applyAddressToForm(addr);
  };

  const editAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setEditingAddressId(addr._id);
    setAddressError("");
    setIsAddressModalOpen(true);
    applyAddressToForm(addr);
  };

  const startNewAddress = () => {
    setIsAddressModalOpen(true);
    setEditingAddressId(null);
    setAddressError("");
    setFormData(newAddressFormData(currentUser));
  };

  const closeAddressModal = () => {
    const selectedAddress = savedAddresses.find(
      (address) => address._id === selectedAddressId,
    );
    if (selectedAddress) applyAddressToForm(selectedAddress);
    setEditingAddressId(null);
    setAddressError("");
    setIsAddressModalOpen(false);
  };

  const confirmRemoveAddress = async () => {
    if (!addressToDelete?._id) return;
    setDeletingAddress(true);
    try {
      await deleteUserAddress(addressToDelete._id);
      const remaining = savedAddresses.filter(
        (item) => item._id !== addressToDelete._id,
      );
      setSavedAddresses(remaining);
      if (selectedAddressId === addressToDelete._id) {
        const next = remaining.find((item) => item.isDefault) || remaining[0];
        if (next) selectAddress(next);
        else setSelectedAddressId(null);
      }
      setAddressToDelete(null);
    } catch (requestError) {
      setAddressError(
        requestError.message || "Could not remove saved address.",
      );
    } finally {
      setDeletingAddress(false);
    }
  };

  const currentEditingAddress = useMemo(
    () => savedAddresses.find((a) => a._id === editingAddressId) || null,
    [savedAddresses, editingAddressId],
  );

  const addressModalInitial = useMemo(
    () => addressModalValues(currentEditingAddress, currentUser, savedAddresses.length),
    [currentEditingAddress, currentUser, savedAddresses.length],
  );

  const saveAddress = async (values) => {
    const required = requiredAddressFields(values);
    if (!required.fullName || !required.line1 || !required.city || !required.postalCode) {
      setAddressError("Please complete the required delivery address fields.");
      return;
    }
    setSavingAddress(true);
    setAddressError("");
    const payload = toAddressPayload(values, required, currentUser);
    try {
      const address = editingAddressId
        ? await updateUserAddress(editingAddressId, payload)
        : await saveUserAddress({
            ...payload,
            isDefault: values.isDefault ?? savedAddresses.length === 0,
          });
      setSavedAddresses((current) =>
        uniqueAddresses(
          editingAddressId
            ? current.map((item) => (item._id === address._id ? address : item))
            : [address, ...current],
        ),
      );
      setIsAddressModalOpen(false);
      setEditingAddressId(null);
      selectAddress(address);
    } catch (requestError) {
      setAddressError(requestError.message || "Could not save address.");
    } finally {
      setSavingAddress(false);
    }
  };

  const defaultAddress =
    savedAddresses.find((address) => address.isDefault) || savedAddresses[0];
  const otherAddresses = savedAddresses.filter(
    (address) => address._id !== defaultAddress?._id,
  );

  return {
    savedAddresses,
    defaultAddress,
    otherAddresses,
    selectedAddressId,
    loadingAddresses,
    addressError,
    formData,
    isAddressModalOpen,
    editingAddressId,
    addressModalInitial,
    savingAddress,
    addressToDelete,
    deletingAddress,
    selectAddress,
    editAddress,
    startNewAddress,
    closeAddressModal,
    saveAddress,
    requestRemoveAddress: setAddressToDelete,
    cancelRemoveAddress: () => setAddressToDelete(null),
    confirmRemoveAddress,
  };
}
