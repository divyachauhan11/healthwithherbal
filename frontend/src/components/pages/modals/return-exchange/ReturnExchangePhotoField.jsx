import { ImagePlus } from "lucide-react";

/**
 * Optional photo picker of the return/exchange form (JPG, PNG or WebP).
 * @param {object} props
 * @param {boolean} props.disabled Disable while the request is being sent.
 * @param {(event: Event) => void} props.onChange Handles the picked files.
 */
export function ReturnExchangePhotoField({ disabled, onChange }) {
  return (
    <label className="return-exchange-field">
      Photos (optional, up to 4)
      <span className="return-exchange-upload">
        <ImagePlus size={17} />
        <span>Choose photos · JPG, PNG, or WebP; 5 MB max each</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={disabled}
          onChange={onChange}
        />
      </span>
    </label>
  );
}
