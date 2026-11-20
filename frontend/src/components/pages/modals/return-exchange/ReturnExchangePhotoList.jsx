import { returnPhotoKey } from "./return-exchange-utils";

/**
 * Photos attached to the return/exchange request, each removable.
 * @param {object} props
 * @param {File[]} props.photos Attached photos.
 * @param {boolean} props.disabled Disable removal while the request is being sent.
 * @param {(index: number) => void} props.onRemove Removes the photo at `index`.
 */
export function ReturnExchangePhotoList({ photos, disabled, onRemove }) {
  return (
    <div className="return-exchange-photo-list">
      {photos.map((photo, index) => (
        <div key={returnPhotoKey(photo)}>
          <span>{photo.name}</span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onRemove(index)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
