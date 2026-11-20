"use client";
import { useEffect, useState } from "react";
import { fetchStoreInit } from "@/lib/api";
import { getCachedStoreData, saveCachedStoreData } from "@/lib/session";
import { normalizeStoreData } from "./storefront-utils";

/**
 * Owns the storefront catalogue from `/store/init`. On mount it shows the
 * cached copy (if any), then replaces it with the fresh response and caches it.
 * @returns {{
 *   products: Array<object>, categories: Array<object>, navigationCategories: Array<object>,
 *   featuredCategoryIds: Array<string>, brands: Array<object>, coupons: Array<object>,
 *   announcements: Array<string>, returnExchangeEnabled?: boolean, blogs: Array<object>,
 *   reviews: Array<object>,
 * }}
 */
export function useStoreData() {
  const [storeData, setStoreData] = useState({
    products: [],
    categories: [],
    navigationCategories: [],
    featuredCategoryIds: [],
    brands: [],
    coupons: [],
    announcements: [],
    returnExchangeEnabled: true,
    blogs: [],
    reviews: [],
  });

  useEffect(() => {
    let active = true;
    let hasCachedCatalog = false;
    try {
      const cachedCatalog = getCachedStoreData();
      if (cachedCatalog && Array.isArray(cachedCatalog.products)) {
        setStoreData(normalizeStoreData(cachedCatalog));
        hasCachedCatalog = true;
      }
    } catch (error) {
      console.warn("Could not restore cached store data:", error);
    }

    fetchStoreInit()
      .then((data) => {
        if (!active || !data) return;
        const freshCatalog = normalizeStoreData(data);
        setStoreData(freshCatalog);
        try {
          saveCachedStoreData(freshCatalog);
        } catch (error) {
          console.warn("Could not cache store data:", error);
        }
      })
      .catch((err) => {
        if (hasCachedCatalog) {
          console.warn("Store API is unavailable; showing the last saved catalog:", err);
        } else {
          console.error("Failed to load live store data:", err);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return storeData;
}
