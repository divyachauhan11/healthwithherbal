import { returnPhotoKey } from "@/components/pages/modals/return-exchange/return-exchange-utils";

/**
 * Photos attached to the account return/exchange request, each removable.
 * @param {object} props
 * @param {File[]} props.photos Attached photos.
 * @param {boolean} props.disabled Disable removal while the request is being sent.
 * @param {(index: number) => void} props.onRemove Removes the photo at `index`.
 */
export function ReturnRequestPhotoList({ photos, disabled, onRemove }) {
  return (
    <div className="return-request-photo-list">{photos.map((photo, index) => (
      <div key={returnPhotoKey(photo)}><span>{photo.name}</span><button type="button" disabled={disabled} onClick={() => onRemove(index)} aria-label={`Remove ${photo.name}`}>Remove</button></div>
    ))}</div>
  );
}
