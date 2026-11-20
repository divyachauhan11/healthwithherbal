import { ImageDropzoneContent } from "./ImageDropzoneContent";

/**
 * Click/drag-and-drop area with the hidden file input.
 * @param {object} props
 * @param {boolean} props.dragOver Highlight while files are dragged over.
 * @param {(dragOver: boolean) => void} props.setDragOver
 * @param {boolean} props.uploading
 * @param {boolean} props.atImageLimit
 * @param {boolean} props.multiple
 * @param {number} props.maxImages
 * @param {import("react").RefObject<HTMLInputElement>} props.fileInputRef
 * @param {(event: DragEvent) => void} props.onDrop
 * @param {() => void} props.onBrowse Opens the file picker.
 * @param {(files: FileList) => void} props.onFiles Receives picked files.
 */
export function ImageDropzone({
  dragOver,
  setDragOver,
  uploading,
  atImageLimit,
  multiple,
  maxImages,
  fileInputRef,
  onDrop,
  onBrowse,
  onFiles,
}) {
  return (
    <div
      className={`upload-dropzone ${dragOver ? "dragover" : ""} ${uploading ? "uploading" : ""} ${atImageLimit ? "at-limit" : ""}`}
      aria-disabled={atImageLimit || uploading}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      onClick={onBrowse}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        disabled={atImageLimit}
        style={{ display: "none" }}
        onChange={(e) => onFiles(e.target.files)}
      />
      <ImageDropzoneContent
        uploading={uploading}
        multiple={multiple}
        maxImages={maxImages}
        atImageLimit={atImageLimit}
      />
    </div>
  );
}
