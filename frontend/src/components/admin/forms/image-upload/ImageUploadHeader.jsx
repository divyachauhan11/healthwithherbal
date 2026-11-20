/**
 * Image upload field header: label, optional description and the
 * "+ Add via URL" / "Hide URL input" toggle.
 * @param {object} props
 * @param {import("react").ReactNode} props.label
 * @param {import("react").ReactNode} [props.description]
 * @param {boolean} props.showUrlInput Whether the URL row is open.
 * @param {boolean} props.disabled Disables the toggle (limit reached or uploading).
 * @param {() => void} props.onToggleUrlInput
 */
export function ImageUploadHeader({
  label,
  description,
  showUrlInput,
  disabled,
  onToggleUrlInput,
}) {
  return (
    <div className="image-upload-header">
      <div>
        <label className="image-upload-label">{label}</label>
        {description && <p className="image-upload-sub">{description}</p>}
      </div>
      <button
        type="button"
        className="text-link-btn"
        disabled={disabled}
        onClick={onToggleUrlInput}
      >
        {showUrlInput ? "Hide URL input" : "+ Add via URL"}
      </button>
    </div>
  );
}
