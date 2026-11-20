import { UploadedImageCard } from "./UploadedImageCard";

/**
 * Gallery of selected images with a count header.
 * @param {object} props
 * @param {string[]} props.images
 * @param {(index: number) => void} props.onSetPrimary
 * @param {(index: number) => void} props.onRemove
 */
export function UploadedImageGallery({ images, onSetPrimary, onRemove }) {
  return (
    <div className="uploaded-gallery">
      <div className="uploaded-gallery-head">
        <span>
          {images.length} image{images.length > 1 ? "s" : ""} selected
        </span>
        {images.length > 1 && (
          <span className="muted-hint">First photo is the primary cover</span>
        )}
      </div>
      <div className="uploaded-grid">
        {images.map((imgUrl, idx) => (
          <UploadedImageCard
            key={idx}
            url={imgUrl}
            index={idx}
            onSetPrimary={onSetPrimary}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}
