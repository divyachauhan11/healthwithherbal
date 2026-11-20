"use client";
import { useEffect, useState } from "react";
import { fetchStoreInit } from "@/lib/api";

/**
 * Owns the shop's live catalogue: starts from the storefront's store data,
 * refetches `/store/init` on mount and follows later prop updates.
 * @param {object} options
 * @param {Array<object>} options.products Products from the storefront.
 * @param {Array<object>} options.categories Categories from the storefront.
 * @param {Array<object>} options.brands Brands from the storefront.
 * @returns {{products: Array<object>, categories: Array<object>, brands: Array<object>}}
 *   The live lists, falling back to the given ones while the live list is empty.
 */
export function useShopCatalog({
  products: productsProp,
  categories: categoriesProp,
  brands: brandsProp,
}) {
  // Live state synchronized with backend
  const [catalogProducts, setCatalogProducts] = useState(productsProp || []);
  const [catalogCategories, setCatalogCategories] = useState(categoriesProp || []);
  const [catalogBrands, setCatalogBrands] = useState(brandsProp || []);

  // Always fetch fresh backend catalog data on mount
  useEffect(() => {
    let active = true;
    fetchStoreInit()
      .then((data) => {
        if (!active || !data) return;
        if (Array.isArray(data.products)) {
          setCatalogProducts(data.products);
        }
        if (Array.isArray(data.categories)) {
          setCatalogCategories(data.categories);
        }
        if (Array.isArray(data.brands)) {
          setCatalogBrands(data.brands);
        }
      })
      .catch((err) => {
        console.warn("Could not load backend store init data:", err);
      });
    return () => {
      active = false;
    };
  }, []);

  // Sync state if props change from parent
  useEffect(() => {
    if (productsProp) setCatalogProducts(productsProp);
  }, [productsProp]);

  useEffect(() => {
    if (categoriesProp) setCatalogCategories(categoriesProp);
  }, [categoriesProp]);

  useEffect(() => {
    if (brandsProp) setCatalogBrands(brandsProp);
  }, [brandsProp]);

  return {
    products: catalogProducts.length > 0 ? catalogProducts : (productsProp || []),
    categories: catalogCategories.length > 0 ? catalogCategories : (categoriesProp || []),
    brands: catalogBrands.length > 0 ? catalogBrands : (brandsProp || []),
  };
}
