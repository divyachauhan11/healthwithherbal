"use client";
import { useMemo, useState } from "react";
import { submitReturnExchangeEmail, uploadReturnExchangePhotos } from "@/lib/api";
import { RETURN_EXCHANGE_TYPES } from "@/constants/statuses";
import {
  appendReturnPhotos,
  hasOversizedPhoto,
  removeReturnPhoto,
  RETURN_PHOTO_TOO_LARGE,
} from "./return-exchange-utils";

/**
 * Form state and submission of the emailed return/exchange request dialog:
 * request type, product and quantity, reason and photos (uploaded first,
 * then emailed to the care team with the customer in copy).
 * @param {object} options
 * @param {object|null} options.order Order the request is about.
 * @param {object|null} [options.currentUser] Signed-in customer.
 * @param {number|null} [options.initialItemIndex] Order line preselected in the product field.
 * @param {() => void} [options.onClose] Closes the dialog.
 * @returns {{
 *   requestType: string, setRequestType: Function, productChoice: string,
 *   chooseProduct: (value: string) => void, selectedProduct: object|null,
 *   quantity: string, setQuantity: Function, reason: string, setReason: Function,
 *   photos: File[], handlePhotoInput: (event: Event) => void, removePhoto: (index: number) => void,
 *   sending: boolean, error: string, sent: boolean, customerEmail: string,
 *   close: () => void, submit: (event: Event) => Promise<void>,
 * }}
 */
export function useReturnExchangeEmailRequest({ order, currentUser, initialItemIndex, onClose }) {
  const [requestType, setRequestType] = useState(RETURN_EXCHANGE_TYPES[0]);
  const [productChoice, setProductChoice] = useState(
    initialItemIndex == null ? "" : String(initialItemIndex),
  );
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [photos, setPhotos] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const selectedProduct = useMemo(() => {
    const index = Number(productChoice);
    return productChoice && Number.isInteger(index)
      ? order?.items?.[index] || null
      : null;
  }, [order, productChoice]);

  const customerEmail = currentUser?.email || order?.customer?.email || order?.guestEmail || "";
  const close = () => !sending && onClose?.();

  const chooseProduct = (value) => {
    setProductChoice(value);
    setQuantity("1");
  };

  const handlePhotoInput = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (hasOversizedPhoto(selectedFiles)) {
      setError(RETURN_PHOTO_TOO_LARGE);
      event.target.value = "";
      return;
    }
    setPhotos((current) => appendReturnPhotos(current, selectedFiles));
    setError("");
    event.target.value = "";
  };

  const removePhoto = (index) => setPhotos((current) => removeReturnPhoto(current, index));

  const submit = async (event) => {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");
    try {
      const photoUrls = photos.length
        ? await uploadReturnExchangePhotos(photos)
        : [];
      await submitReturnExchangeEmail({
        orderNumber: order.orderNumber,
        email: customerEmail,
        type: requestType,
        ...(selectedProduct ? { itemIndex: Number(productChoice), quantity: Number(quantity) } : {}),
        reason: reason.trim(),
        photoUrls,
      });
      setSent(true);
    } catch (submitError) {
      setError(
        submitError.message || "Could not prepare the email. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  return {
    requestType,
    setRequestType,
    productChoice,
    chooseProduct,
    selectedProduct,
    quantity,
    setQuantity,
    reason,
    setReason,
    photos,
    handlePhotoInput,
    removePhoto,
    sending,
    error,
    sent,
    customerEmail,
    close,
    submit,
  };
}
