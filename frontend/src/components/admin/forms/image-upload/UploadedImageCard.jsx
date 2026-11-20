import { Star, Trash2 } from "lucide-react";

/**
 * Thumbnail card of an uploaded image with the cover badge or
 * "Set cover" action, and a remove button.
 * @param {object} props
 * @param {string} props.url Image URL.
 * @param {number} props.index Position in the list (0 = cover).
 * @param {(index: number) => void} props.onSetPrimary
 * @param {(index: number) => void} props.onRemove
 */
export function UploadedImageCard({ url, index, onSetPrimary, onRemove }) {
  return (
    <div className={`uploaded-card ${index === 0 ? "is-primary" : ""}`}>
      <div className="card-thumb">
        <img src={url} alt={`Upload ${index + 1}`} />
      </div>
      {index === 0 ? (
        <span className="cover-badge">
          <Star size={9} fill="currentColor" /> Cover
        </span>
      ) : (
        <button
          type="button"
          className="make-cover-btn"
          onClick={(e) => {
            e.stopPropagation();
            onSetPrimary(index);
          }}
          title="Set as primary cover"
        >
          Set cover
        </button>
      )}
      <button
        type="button"
        className="remove-img-btn"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        title="Remove image"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
