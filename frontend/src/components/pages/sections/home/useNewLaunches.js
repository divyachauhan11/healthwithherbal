"use client";
import { useMemo, useState } from "react";
import { getLaunchProducts } from "./home-utils";

/**
 * Owns the new-launches carousel position.
 * @param {Array<object>} products Catalogue.
 * @returns {{
 *   launchProducts: Array<object>,
 *   visibleItems: Array<object>,
 *   prevSlide: () => void,
 *   nextSlide: () => void,
 * }} `visibleItems` is `launchProducts` rotated to start at the current slide.
 */
export function useNewLaunches(products) {
  const [startIndex, setStartIndex] = useState(0);

  const launchProducts = useMemo(() => getLaunchProducts(products), [products]);

  const prevSlide = () => {
    setStartIndex((curr) => (curr > 0 ? curr - 1 : launchProducts.length - 1));
  };
  const nextSlide = () => {
    setStartIndex((curr) => (curr < launchProducts.length - 1 ? curr + 1 : 0));
  };
  const visibleItems = [
    ...launchProducts.slice(startIndex),
    ...launchProducts.slice(0, startIndex),
  ];

  return { launchProducts, visibleItems, prevSlide, nextSlide };
}
