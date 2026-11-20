"use client";

import { useState } from "react";

/**
 * Owns the values of an inline admin form.
 * @param {() => object} createInitialValues Lazy initial values.
 * @returns {{form: object, setForm: Function, update: (key: string) => (event: Event) => void}}
 *   `update(key)` returns an input change handler (checkboxes store `checked`).
 */
export function useAdminFormFields(createInitialValues) {
  const [form, setForm] = useState(createInitialValues);
  const update = (key) => (event) =>
    setForm((current) => ({
      ...current,
      [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value,
    }));
  return { form, setForm, update };
}
