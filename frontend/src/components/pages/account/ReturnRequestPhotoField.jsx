/**
 * Optional photo picker of the account return/exchange dialog.
 * @param {object} props
 * @param {boolean} props.disabled Disable while the request is being sent.
 * @param {(event: Event) => void} props.onChange Handles the picked files.
 */
export function ReturnRequestPhotoField({ disabled, onChange }) {
  return (
    <label className="return-request-photo-field">Photos (optional, up to 4)
      <input type="file" accept="image/*" multiple disabled={disabled} onChange={onChange} />
      <small>Add photos of the item or issue. JPG, PNG, or WebP; 5 MB max each.</small>
    </label>
  );
}
