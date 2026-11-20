"use client";
import { useState } from "react";
import { submitReturnExchangeRequest, uploadReturnExchangePhotos } from "@/lib/api";
import { RETURN_EXCHANGE_TYPES } from "@/constants/statuses";
import {
  appendReturnPhotos,
  hasOversizedPhoto,
  removeReturnPhoto,
  RETURN_PHOTO_TOO_LARGE,
} from "@/components/pages/modals/return-exchange/return-exchange-utils";
import { addReturnRequestToOrders, buildReturnRequestMailto } from "./account-utils";

/**
 * State and submission of the account page's return/exchange request dialog.
 * When returns/exchanges are enabled the request (with uploaded photos) is
 * submitted for review and added to the order; otherwise an email draft opens.
 * @param {object} options
 * @param {object|null} options.currentUser Signed-in customer.
 * @param {boolean} options.returnExchangeEnabled Store accepts requests online.
 * @param {Function} options.setOrders Setter for the account's orders.
 * @param {(message: string) => void} [options.notify] Toast notifier.
 * @returns {{
 *   request: {item: object, order: object, itemIndex: number}|null,
 *   type: string, setType: Function, quantity: number|string, setQuantity: Function,
 *   reason: string, setReason: Function, photos: File[], saving: boolean,
 *   open: (item: object, order: object, itemIndex: number) => void, close: () => void,
 *   handlePhotoInput: (event: Event) => void, removePhoto: (index: number) => void,
 *   submit: (event: Event) => Promise<void>,
 * }}
 */
export function useReturnRequest({ currentUser, returnExchangeEnabled, setOrders, notify }) {
  const [returnRequestData, setReturnRequestData] = useState(null);
  const [returnRequestType, setReturnRequestType] = useState(RETURN_EXCHANGE_TYPES[0]);
  const [returnRequestQuantity, setReturnRequestQuantity] = useState(1);
  const [returnRequestReason, setReturnRequestReason] = useState("");
  const [savingReturnRequest, setSavingReturnRequest] = useState(false);
  const [returnRequestPhotos, setReturnRequestPhotos] = useState([]);

  const open = (item, order, itemIndex) => {
    setReturnRequestData({ item, order, itemIndex });
    setReturnRequestQuantity(1);
    setReturnRequestType(RETURN_EXCHANGE_TYPES[0]);
    setReturnRequestReason("");
    setReturnRequestPhotos([]);
  };

  const close = () => setReturnRequestData(null);

  const handlePhotoInput = (event) => {
    const nextFiles = Array.from(event.target.files || []);
    if (hasOversizedPhoto(nextFiles)) {
      notify?.(RETURN_PHOTO_TOO_LARGE);
      event.target.value = "";
      return;
    }
    setReturnRequestPhotos((current) => appendReturnPhotos(current, nextFiles));
    event.target.value = "";
  };

  const removePhoto = (index) => setReturnRequestPhotos((current) => removeReturnPhoto(current, index));

  const submit = async (event) => {
    event.preventDefault();
    if (!returnRequestData) return;
    setSavingReturnRequest(true);
    try {
      const photoUrls = returnRequestPhotos.length
        ? await uploadReturnExchangePhotos(returnRequestPhotos)
        : [];
      const orderNumber = returnRequestData.order.orderNumber;
      const itemTitle = returnRequestData.item.title;
      if (returnExchangeEnabled) {
        const result = await submitReturnExchangeRequest({
          orderNumber,
          email: currentUser?.email || returnRequestData.order.customer?.email,
          itemIndex: returnRequestData.itemIndex,
          quantity: Number(returnRequestQuantity),
          type: returnRequestType,
          reason: returnRequestReason,
          photoUrls,
        });
        if (result.request) {
          setOrders((current) => addReturnRequestToOrders(current, orderNumber, result.request));
        }
        notify?.("Your request has been submitted for review.");
      } else {
        window.location.href = buildReturnRequestMailto({
          type: returnRequestType,
          orderNumber,
          itemTitle,
          quantity: returnRequestQuantity,
          reason: returnRequestReason,
          photoUrls,
        });
      }
      setReturnRequestData(null);
      setReturnRequestReason("");
      setReturnRequestPhotos([]);
    } catch (error) {
      notify?.(error.message);
    } finally {
      setSavingReturnRequest(false);
    }
  };

  return {
    request: returnRequestData,
    type: returnRequestType,
    setType: setReturnRequestType,
    quantity: returnRequestQuantity,
    setQuantity: setReturnRequestQuantity,
    reason: returnRequestReason,
    setReason: setReturnRequestReason,
    photos: returnRequestPhotos,
    saving: savingReturnRequest,
    open,
    close,
    handlePhotoInput,
    removePhoto,
    submit,
  };
}
