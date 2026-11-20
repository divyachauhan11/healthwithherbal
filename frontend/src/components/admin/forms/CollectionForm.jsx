import { useState } from "react";
import { slugify } from "@/components/admin/global/admin-utils";
import { AdminFormActions } from "./AdminFormActions";
import { AdminFormHeading } from "./AdminFormHeading";
import { ImageUploadField } from "./ImageUploadField";
import { getRecordImages } from "./admin-form-utils";

/**
 * Inline brand or category create/edit form (name, derived slug, type,
 * description, and brand images).
 * @param {object} props
 * @param {string} props.kind "brands"/"Brands" for a brand, otherwise a category.
 * @param {object|null} [props.initial] Record being edited.
 * @param {(body: object) => void} props.onSave
 * @param {() => void} props.onClose
 * @param {boolean} [props.busy]
 */
export function CollectionForm({ kind, initial, onSave, onClose, busy }) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [type, setType] = useState(initial?.type || "form");
  const [images, setImages] = useState(() => getRecordImages(initial, ["image", "logoUrl"]));

  const isBrand = kind === "brands" || kind === "Brands";

  return (
    <form
      className="admin-form"
      onSubmit={(event) => {
        event.preventDefault();
        const primary = images[0] || "";
        onSave({
          name,
          slug: slugify(name),
          description,
          type,
          isActive: true,
          image: primary,
          logoUrl: primary,
          images: images.length ? images : (primary ? [primary] : []),
        });
      }}
    >
      <AdminFormHeading
        title={
          <>
            {initial ? "Edit" : "Add"} {isBrand ? "brand" : "category"}
          </>
        }
        description={
          isBrand
            ? "Manage brand details, logos, and promotional imagery."
            : "Keep catalog navigation and category structure current."
        }
        onClose={onClose}
      />
      <div className="form-section">
        <div className="form-grid">
          <label>
            Name
            <input required value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Slug
            <input readOnly value={slugify(name)} />
          </label>
          {!isBrand && (
            <label>
              Category type
              <select value={type} onChange={(event) => setType(event.target.value)}>
                <option value="form">Product form</option>
                <option value="concern">Health concern</option>
              </select>
            </label>
          )}
          <label className="wide">
            Description
            <textarea
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>

          {isBrand && (
            <div className="wide">
              <ImageUploadField
                images={images}
                onChange={setImages}
                multiple={true}
                label="Brand logo & banners (Multiple uploads supported)"
                description="Upload the brand's logo and branding assets. The first image will be used as the brand's primary logo."
              />
            </div>
          )}
        </div>
      </div>
      <AdminFormActions busy={busy} submitLabel="Save changes" onClose={onClose} />
    </form>
  );
}
