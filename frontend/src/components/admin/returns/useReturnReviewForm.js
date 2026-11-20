"use client";

import { useEffect, useState } from "react";
import { REFUND_STATUSES } from "@/constants/statuses";
import { createReviewForm } from "./returns-utils";

/**
 * Owns the review dialog form: resets it for each opened request, closes the dialog on
 * Escape (unless saving) and submits the values with a numeric refund amount.
 * @param {{request: object|null, saving: boolean, onClose: Function, onSave: Function}} options
 * @returns {{form: object, update: (name: string) => Function, changeRefundStatus: Function, submit: Function}}
 */
export function useReturnReviewForm({ request, saving, onClose, onSave }) {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (!request) return;
    setForm(createReviewForm(request));
  }, [request]);

  useEffect(() => {
    if (!request) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && !saving && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [request, saving, onClose]);

  const update = (name) => (event) => setForm((current) => ({ ...current, [name]: event.target.value }));

  const changeRefundStatus = (event) => setForm((current) => ({
    ...current,
    refundStatus: event.target.value,
    ...(event.target.value === REFUND_STATUSES[0] ? { refundAmount: 0, refundMethod: "not_applicable" } : {}),
  }));

  const submit = (event) => {
    event.preventDefault();
    onSave({ ...form, refundAmount: Number(form.refundAmount) || 0 });
  };

  return { form, update, changeRefundStatus, submit };
}
