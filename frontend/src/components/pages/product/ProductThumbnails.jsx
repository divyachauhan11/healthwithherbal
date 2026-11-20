"use client";

/**
 * Thumbnail strip that switches the main product image.
 * @param {object} props
 * @param {string[]} props.images
 * @param {string} props.activeImage Currently displayed image.
 * @param {string} [props.productTitle] Used in the thumbnails' alt text.
 * @param {(image: string) => void} props.onSelect
 */
export function ProductThumbnails({ images, activeImage, productTitle, onSelect }) {
  return (
    <div className="thumbnail-row">
      {images.map((imgUrl, idx) => (
        <button
          key={idx}
          type="button"
          className={activeImage === imgUrl ? "active" : ""}
          onClick={() => onSelect(imgUrl)}
        >
          <img
            src={imgUrl}
            alt={`${productTitle || "Product"} view ${idx + 1}`}
          />
        </button>
      ))}
    </div>
  );
}
