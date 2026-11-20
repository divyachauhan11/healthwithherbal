"use client";
import { useEffect, useMemo, useState } from "react";
import { getGalleryImages } from "./product-utils";

/**
 * Owns the product gallery's displayed image, reset to the first image
 * whenever the product changes.
 * @param {object|null} product
 * @returns {{galleryImages: string[], displayedImage: string, setDisplayedImage: Function}}
 */
export function useProductGallery(product) {
  const galleryImages = useMemo(() => getGalleryImages(product), [product]);

  const [displayedImage, setDisplayedImage] = useState(
    () => galleryImages[0] || product?.image || "",
  );

  useEffect(() => {
    setDisplayedImage(galleryImages[0] || product?.image || "");
  }, [galleryImages, product]);

  return { galleryImages, displayedImage, setDisplayedImage };
}
