"use client";

import { FormModal } from "./FormModal";

export function CategoryModal({
  isOpen,
  initial = null,
  categories = [],
  onSave,
  onClose,
  busy = false,
}) {
  return (
    <FormModal
      entity="category"
      isOpen={isOpen}
      initial={initial}
      categories={categories}
      onSave={onSave}
      onClose={onClose}
      busy={busy}
    />
  );
}

export const AddCategoryModal = CategoryModal;
export default CategoryModal;
