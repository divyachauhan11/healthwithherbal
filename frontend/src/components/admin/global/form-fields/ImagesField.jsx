import { ImageUploadField } from "../../forms";

/**
 * Full-width image upload field of a FormModal schema.
 * @param {object} props
 * @param {object} props.field Field config (label, description, multiple, maxImages).
 * @param {string[]} props.images Current image URLs.
 * @param {(images: string[]) => void} props.onChange Replaces the image list (pass a stable setter).
 */
export function ImagesField({ field, images, onChange }) {
  return (
    <div className="wide">
      <ImageUploadField
        images={images}
        onChange={onChange}
        multiple={field.multiple !== false}
        maxImages={field.maxImages}
        label={field.label}
        description={field.description}
      />
    </div>
  );
}
