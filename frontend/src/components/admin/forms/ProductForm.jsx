import { useState } from "react";
import { AdminFormActions } from "./AdminFormActions";
import { AdminFormHeading } from "./AdminFormHeading";
import { CatalogNameSelect } from "./CatalogNameSelect";
import { ImageUploadField } from "./ImageUploadField";
import { getRecordImages } from "./admin-form-utils";
import { useAdminFormFields } from "./useAdminFormFields";

/**
 * Inline product create/edit form (details, prices, stock, photos, visibility).
 * @param {object} props
 * @param {object|null} [props.initial] Product being edited.
 * @param {Array} props.brands Brand records for the brand select.
 * @param {Array} [props.categories] Category records (parent categories are skipped).
 * @param {(body: object) => void} props.onSave
 * @param {() => void} props.onClose
 * @param {boolean} [props.busy]
 */
export function ProductForm({ initial, brands, categories, onSave, onClose, busy }) {
  const productCategories = (categories || []).filter((category) => !category?.isParent);
  const { form, update } = useAdminFormFields(() => ({
    title: initial?.title || "",
    sku: initial?.sku || "",
    brand: initial?.brand || "",
    category: initial?.category || "",
    description: initial?.description || "",
    original: initial?.original ?? "",
    price: initial?.price ?? "",
    stockQty: initial?.stockQty ?? 0,
    active: initial?.active ?? true,
  }));
  const [images, setImages] = useState(() => getRecordImages(initial, ["image"]));

  return (
    <form
      className="admin-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          ...form,
          image: images[0] || "",
          images: images.length ? images : (images[0] ? [images[0]] : []),
        });
      }}
    >
      <AdminFormHeading
        title={initial?._id ? "Edit product" : "Add product"}
        description="Update the catalog details, photos, and stock available for sale."
        onClose={onClose}
      />
      <div className="form-section">
        <h3>Product details</h3>
        <div className="form-grid">
          <label className="wide">
            Product name
            <input required value={form.title} onChange={update("title")} />
          </label>
          <label>
            SKU
            <input required value={form.sku} onChange={update("sku")} />
          </label>
          <label>
            Brand
            <CatalogNameSelect
              value={form.brand}
              onChange={update("brand")}
              items={brands}
              placeholder="Choose brand"
            />
          </label>
          <label>
            Category
            <CatalogNameSelect
              value={form.category}
              onChange={update("category")}
              items={productCategories}
              placeholder="Choose category"
            />
          </label>
          <label className="wide">
            Description
            <textarea
              rows={4}
              required
              value={form.description}
              onChange={update("description")}
            />
          </label>
          <label>
            Regular price (₹)
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={form.original}
              onChange={update("original")}
            />
          </label>
          <label>
            Sale price (₹)
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={form.price}
              onChange={update("price")}
            />
          </label>
          <label>
            Stock quantity
            <input
              type="number"
              min="0"
              step="1"
              required
              value={form.stockQty}
              onChange={update("stockQty")}
            />
          </label>

          <div className="wide">
            <ImageUploadField
              images={images}
              onChange={setImages}
              multiple={true}
              maxImages={9}
              label="Product photos (Multiple uploads supported)"
              description="Upload up to 9 high-quality product images. The first photo will be used as the main storefront cover image."
            />
          </div>

          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={form.active}
              onChange={update("active")}
            />{" "}
            Visible in the storefront
          </label>
        </div>
      </div>
      <AdminFormActions
        busy={busy}
        submitLabel={initial?._id ? "Save product" : "Create product"}
        onClose={onClose}
      />
    </form>
  );
}
