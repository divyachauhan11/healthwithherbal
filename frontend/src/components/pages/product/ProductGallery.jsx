"use client";
import { ProductImageBadges } from "./ProductImageBadges";
import { ProductThumbnails } from "./ProductThumbnails";

/**
 * Product image gallery: main image with badges, plus thumbnails when there
 * is more than one image.
 * @param {object} props
 * @param {object} props.product
 * @param {string[]} props.badges Badge labels.
 * @param {string[]} props.galleryImages
 * @param {string} props.displayedImage
 * @param {(image: string) => void} props.onSelectImage
 */
export function ProductGallery({ product, badges, galleryImages, displayedImage, onSelectImage }) {
  return (
    <div className="detail-gallery">
      <div className="detail-main-image">
        <ProductImageBadges badges={badges} />
        <img
          src={displayedImage || product?.image || "/fallback-product.jpg"}
          alt={product?.title || "Product image"}
        />
      </div>
      {galleryImages.length > 1 && (
        <ProductThumbnails
          images={galleryImages}
          activeImage={displayedImage}
          productTitle={product?.title}
          onSelect={onSelectImage}
        />
      )}
    </div>
  );
}
