"use client";

import { FormModal } from "./FormModal";

export function ProductModal({
  isOpen,
  initial = null,
  brands = [],
  categories = [],
  catalog,
  onSave,
  onClose,
  busy = false,
}) {
  return (
    <FormModal
      entity="product"
      isOpen={isOpen}
      initial={initial}
      brands={brands}
      categories={categories}
      catalog={catalog}
      onSave={onSave}
      onClose={onClose}
      busy={busy}
    />
  );
}

export default ProductModal;
