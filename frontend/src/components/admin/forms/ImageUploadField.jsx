import {
  ImageDropzone,
  ImageUploadHeader,
  ImageUrlInputRow,
  UploadedImageGallery,
  useImageUpload,
} from "./image-upload";

/**
 * Admin image picker: upload by click/drag-and-drop or URL, then reorder
 * (first image is the cover) or remove the selected images.
 * @param {object} props
 * @param {string[]} [props.images=[]] Current image URLs.
 * @param {(images: string[]) => void} props.onChange Replaces the image list.
 * @param {boolean} [props.multiple=true] Allow several images.
 * @param {number} [props.maxImages=Infinity] Maximum number of images.
 * @param {string} [props.label="Images"]
 * @param {string} [props.description]
 */
export function ImageUploadField({
  images = [],
  onChange,
  multiple = true,
  maxImages = Infinity,
  label = "Images",
  description = "Upload images (PNG, JPG, WebP, SVG). The first image will be used as the primary cover.",
}) {
  const {
    uploading,
    dragOver,
    setDragOver,
    error,
    urlInput,
    setUrlInput,
    showUrlInput,
    setShowUrlInput,
    fileInputRef,
    atImageLimit,
    handleFiles,
    onDrop,
    openFilePicker,
    removeImage,
    setPrimary,
    addUrl,
  } = useImageUpload({ images, onChange, multiple, maxImages });

  return (
    <div className="image-upload-wrapper">
      <ImageUploadHeader
        label={label}
        description={description}
        showUrlInput={showUrlInput}
        disabled={atImageLimit || uploading}
        onToggleUrlInput={() => setShowUrlInput((v) => !v)}
      />

      {showUrlInput && (
        <ImageUrlInputRow value={urlInput} onChange={setUrlInput} onAdd={addUrl} />
      )}

      {error && <div className="upload-error-alert">{error}</div>}

      <ImageDropzone
        dragOver={dragOver}
        setDragOver={setDragOver}
        uploading={uploading}
        atImageLimit={atImageLimit}
        multiple={multiple}
        maxImages={maxImages}
        fileInputRef={fileInputRef}
        onDrop={onDrop}
        onBrowse={openFilePicker}
        onFiles={handleFiles}
      />

      {images.length > 0 && (
        <UploadedImageGallery
          images={images}
          onSetPrimary={setPrimary}
          onRemove={removeImage}
        />
      )}
    </div>
  );
}
