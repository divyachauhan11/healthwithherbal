"use client";

import { Modal } from "./Modal";
import { FormModalField, useFormModal } from "./form-modal";

/**
 * Global Unified FormModal Component
 *
 * Can be used in two ways:
 * 1. Schema-driven by specifying `entity="product" | "category" | "parent-category" | "brand" | "address" | "coupon" | "blog"`
 *    (field configuration lives in `./form-schemas`)
 * 2. Fully custom by providing a `fields` array and `title`
 *
 * @param {boolean} isOpen - Modal visibility state
 * @param {string} entity - Pre-defined entity type
 * @param {Array} fields - Custom fields array (if entity not specified or to override)
 * @param {object|null} initial - Existing record being edited, or null for creation
 * @param {string} title - Optional title override
 * @param {string} subtitle - Optional subtitle override
 * @param {object} catalog - Catalog object with { brands, categories }
 * @param {Array} brands - Convenience array for product brand choices
 * @param {Array} categories - Convenience array for category choices
 * @param {Function} onSave - Submission callback receiving clean payload
 * @param {Function} onClose - Close callback
 * @param {boolean} busy - Saving/loading state
 * @param {string} submitLabel - Button label
 * @param {string} maxWidth - Card width (default: 820px)
 * @param {string} className - Extra class for the backdrop and card
 * @param {import("react").ReactNode} children - Extra content rendered after the fields
 */
export function FormModal({
  isOpen,
  entity,
  fields: customFields,
  initial = null,
  title: customTitle,
  subtitle: customSubtitle,
  catalog,
  brands,
  categories,
  onSave,
  onClose,
  busy = false,
  submitLabel,
  maxWidth = "820px",
  className = "",
  children,
}) {
  const {
    fields,
    title,
    subtitle,
    form,
    images,
    setImages,
    updateField,
    handleSlugInput,
    handleSubmit,
  } = useFormModal({
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
  });

  if (!isOpen) return null;

  const defaultSubmitLabel = initial?._id ? "Save changes" : "Create";

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      subtitle={subtitle}
      maxWidth={maxWidth}
      className={className}
      onClose={onClose}
      onSubmit={handleSubmit}
      busy={busy}
      submitLabel={submitLabel || defaultSubmitLabel}
    >
      <div className="form-grid">
        {fields.map((field) => (
          <FormModalField
            key={field.name}
            field={field}
            form={form}
            images={images}
            onImagesChange={setImages}
            onFieldChange={updateField}
            onSlugInput={handleSlugInput}
          />
        ))}

        {children}
      </div>
    </Modal>
  );
}

export default FormModal;
