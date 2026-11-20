"use client";
import { useMemo, useState } from "react";
import {
  getBestsellers,
  getConcernNames,
  getFeaturedCategories,
  getShelfProducts,
} from "./home-utils";

/**
 * Owns the home page's selected herbal-shelf tab and derives the products and
 * categories each home section shows.
 * @param {object} options
 * @param {Array<object>} options.products
 * @param {Array<object>} options.categories
 * @param {Array<object>} options.navigationCategories
 * @param {Array<string>} options.featuredCategoryIds
 * @returns {{
 *   shelf: string, setShelf: Function, shelfProducts: Array<object>,
 *   bestsellerProducts: Array<object>, featuredCategories: Array<object>,
 *   displayedConcerns: string[],
 * }}
 */
export function useHomeProducts({ products, categories, navigationCategories, featuredCategoryIds }) {
  const [shelf, setShelf] = useState("Latest");

  const displayedConcerns = getConcernNames(categories);
  const featuredCategories = getFeaturedCategories(navigationCategories, featuredCategoryIds);

  // High rating products in decreasing order for Our Bestsellers
  const bestsellerProducts = useMemo(() => getBestsellers(products), [products]);

  const shelfProducts = getShelfProducts(products, shelf);

  return {
    shelf,
    setShelf,
    shelfProducts,
    bestsellerProducts,
    featuredCategories,
    displayedConcerns,
  };
}
