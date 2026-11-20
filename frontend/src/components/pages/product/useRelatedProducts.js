"use client";
import { useMemo } from "react";
import { getRelatedProducts } from "./product-utils";

/**
 * Memoised "You may also like" products for the product page.
 * @param {object|null} product
 * @param {Array<object>} products
 * @returns {Array<object>} Up to four related products.
 */
export function useRelatedProducts(product, products) {
  return useMemo(() => getRelatedProducts(product, products), [product, products]);
}
