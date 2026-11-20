"use client";
import { useEffect, useMemo, useState } from "react";
import { listBrands } from "@/lib/api";
import { toSliderBrand } from "./home-utils";

/**
 * Owns the brands shown in the brand slider: the given brands, or brands
 * fetched from the API when none are given yet.
 * @param {Array<string|object>} brands Brands from the store data.
 * @returns {{
 *   displayedBrands: Array<object>,
 *   duplicated: Array<object>,
 *   loading: boolean,
 * }} `duplicated` repeats the list once for a seamless marquee loop.
 */
export function useSliderBrands(brands) {
  const [liveBrands, setLiveBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  // If brands prop is empty or not yet loaded from store init, fetch directly from backend API
  useEffect(() => {
    if (brands && brands.length > 0) return;

    let active = true;
    setLoading(true);
    listBrands()
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data) && data.length > 0) {
          setLiveBrands(data);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch brands from backend:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [brands]);

  // Normalize brands strictly from the backend / database
  const displayedBrands = useMemo(() => {
    const source = brands && brands.length > 0 ? brands : liveBrands;
    if (!Array.isArray(source) || source.length === 0) return [];

    return source.map((b) => toSliderBrand(b));
  }, [brands, liveBrands]);

  // Duplicate for seamless infinite marquee loop
  const duplicated = useMemo(() => {
    if (displayedBrands.length === 0) return [];
    return [...displayedBrands, ...displayedBrands];
  }, [displayedBrands]);

  return { displayedBrands, duplicated, loading };
}
