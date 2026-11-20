import { DeleteKindIcon } from "./DeleteKindIcon";

/**
 * Thumbnail of the record being deleted; falls back to the kind icon when
 * there is no image or it fails to load.
 * @param {object} props
 * @param {string|null} props.image Image URL.
 * @param {string} props.title Alt text.
 * @param {string} props.kind Admin collection, used for the fallback icon.
 */
export function DeletePreviewThumb({ image, title, kind }) {
  return (
    <div className="admin-delete-preview-thumb">
      {image ? (
        <img
          src={image}
          alt={title}
          onError={(e) => {
            e.currentTarget.style.display = "none";
            if (e.currentTarget.nextElementSibling) {
              e.currentTarget.nextElementSibling.style.display = "flex";
            }
          }}
        />
      ) : null}
      <div
        className="admin-delete-preview-icon-fallback"
        style={{ display: image ? "none" : "flex" }}
      >
        <DeleteKindIcon kind={kind} />
      </div>
    </div>
  );
}
