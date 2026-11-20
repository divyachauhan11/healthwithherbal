"use client";

import { useEffect, useMemo, useState } from "react";
import { slugify } from "../admin-utils";
import { getEntitySchema, normalizeEntityPayload } from "../form-schemas";
import {
  applyImagePayload,
  getInitialFieldValues,
  getInitialImages,
  getSlugFieldFlags,
  isImageField,
  resolveFormFields,
} from "./form-modal-utils";

/**
 * Owns FormModal state: resolves the entity schema, keeps the field values,
 * images and manually edited slugs, re-initialises them whenever the modal is
 * open and its record or fields change, and builds the cleaned payload on submit.
 * @param {object} options FormModal props (`customFields`, `customTitle` and
 *   `customSubtitle` are the `fields`, `title` and `subtitle` props).
 * @returns {{
 *   fields: Array<object>, title: string, subtitle: string,
 *   form: object, images: string[], setImages: Function,
 *   updateField: (name: string, value: *) => void,
 *   handleSlugInput: (fieldName: string, rawValue: string) => void,
 *   handleSubmit: (event: Event) => void,
 * }}
 */
export function useFormModal({
  isOpen,
  entity,
  customFields,
  initial,
  customTitle,
  customSubtitle,
  catalog,
  brands,
  categories,
  onSave,
}) {
  const entitySchema = useMemo(() => {
    if (!entity) return null;
    return getEntitySchema(entity, { initial, catalog, brands, categories });
  }, [entity, initial, catalog, brands, categories]);

  const fields = resolveFormFields(customFields, entitySchema);
  const title =
    customTitle ||
    entitySchema?.title ||
    (initial?._id ? "Edit Item" : "Add New Item");
  const subtitle = customSubtitle || entitySchema?.subtitle || "";

  const [form, setForm] = useState({});
  const [images, setImages] = useState([]);
  const [customizedSlugs, setCustomizedSlugs] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    setForm(getInitialFieldValues(fields, initial));
    setImages(getInitialImages(initial));
    setCustomizedSlugs(initial?._id ? getSlugFieldFlags(fields) : {});
  }, [isOpen, initial, fields]);

  const updateField = (name, value) => {
    setForm((current) => {
      const next = { ...current, [name]: value };

      // Slug fields follow their source field until edited by hand.
      fields.forEach((f) => {
        if (f.type === "slug" && f.from === name && !customizedSlugs[f.name]) {
          next[f.name] = slugify(value);
        }
      });

      return next;
    });
  };

  const handleSlugInput = (fieldName, rawValue) => {
    setCustomizedSlugs((prev) => ({ ...prev, [fieldName]: true }));
    setForm((current) => ({
      ...current,
      [fieldName]: slugify(rawValue),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = { ...form };
    if (fields.some(isImageField)) applyImagePayload(payload, images);
    normalizeEntityPayload(entity, payload, initial);
    onSave(payload);
  };

  return {
    fields,
    title,
    subtitle,
    form,
    images,
    setImages,
    updateField,
    handleSlugInput,
    handleSubmit,
  };
}
