import { Loader2, Upload } from "lucide-react";

/**
 * Text and icon inside the upload dropzone: progress while uploading,
 * otherwise browse/drop instructions and limits.
 * @param {object} props
 * @param {boolean} props.uploading
 * @param {boolean} props.multiple
 * @param {number} props.maxImages
 * @param {boolean} props.atImageLimit
 */
export function ImageDropzoneContent({ uploading, multiple, maxImages, atImageLimit }) {
  return uploading ? (
    <div className="dropzone-content">
      <Loader2 size={24} className="spin-animate text-forest" />
      <span className="dropzone-title">Uploading image{multiple ? "(s)" : ""}...</span>
      <span className="dropzone-hint">Please wait while the files are being saved</span>
    </div>
  ) : (
    <div className="dropzone-content">
      <div className="upload-icon-circle">
        <Upload size={18} />
      </div>
      <span className="dropzone-title">
        {atImageLimit
          ? `Maximum of ${maxImages} images reached`
          : `Click to browse or drag & drop image${multiple ? "s" : ""}`}
      </span>
      <span className="dropzone-hint">
        Supports JPG, PNG, WebP, GIF, SVG (up to 10MB each)
        {multiple ? " • Select multiple files at once" : ""}
        {Number.isFinite(maxImages) ? ` • Up to ${maxImages} images` : ""}
      </span>
    </div>
  );
}
