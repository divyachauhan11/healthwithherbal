"use client";
import { useMemo, useState } from "react";
import {
  countFilterMatches,
  filterShopProducts,
  getBrandOptions,
  getConcernOptions,
  getFormCategoryOptions,
  getShopHeading,
  sortShopProducts,
  toggleListValue,
} from "./shop-utils";

/**
 * Owns the shop's search, facet, checkbox filters and sort order, and derives
 * the filter options, their counts and the filtered, sorted products.
 * @param {object} options
 * @param {string} [options.view] Catalogue view ("All Products", "Brands", "Shop by Concern" or a category/brand).
 * @param {string} [options.initialTerm] Initial search text.
 * @param {Array<object>} options.products
 * @param {Array<object>} options.categories
 * @param {Array<object>} options.brands
 * @returns {object} Filter state, setters/toggles, `content` (heading copy),
 *   options (`activeBrands`, `activeAyurvedicSubs`, `activeConcernSubs`),
 *   `filterCounts`, `filtered`, `sorted`, `activeFilterLabel` and `hasActiveFilters`.
 */
export function useShopFilters({ view, initialTerm, products, categories, brands }) {
  const [sort, setSort] = useState("Featured");
  const [term, setTerm] = useState(initialTerm || "");
  const [selectedFacet, setSelectedFacet] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedConcerns, setSelectedConcerns] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  // Active Brands from backend
  const activeBrands = useMemo(() => getBrandOptions(brands), [brands]);

  // Form / Product Category from backend (type === "form" or untyped)
  const activeAyurvedicSubs = useMemo(() => getFormCategoryOptions(categories), [categories]);

  // Health Concerns from backend (type === "concern")
  const activeConcernSubs = useMemo(() => getConcernOptions(categories), [categories]);

  // Compute live product counts for all filters
  const filterCounts = useMemo(
    () => countFilterMatches(products, activeConcernSubs),
    [products, activeConcernSubs],
  );

  const content = useMemo(() => getShopHeading(view), [view]);

  const filtered = filterShopProducts(products, {
    view,
    selectedFacet,
    selectedCategories,
    selectedConcerns,
    selectedBrands,
    term,
  });

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) => toggleListValue(prev, cat));
  };
  const toggleConcern = (con) => {
    setSelectedConcerns((prev) => toggleListValue(prev, con));
  };
  const toggleBrand = (b) => {
    setSelectedBrands((prev) => toggleListValue(prev, b));
  };

  const selectBrandFacet = (brand) => {
    setSelectedFacet(brand);
    setTerm(brand);
  };
  const selectConcernFacet = (concern) => {
    setSelectedFacet(concern);
    setTerm("");
  };

  const clearAllFilters = () => {
    setTerm("");
    setSelectedFacet("");
    setSelectedCategories([]);
    setSelectedConcerns([]);
    setSelectedBrands([]);
  };

  const sorted = sortShopProducts(filtered, sort);

  return {
    sort,
    setSort,
    term,
    setTerm,
    selectedFacet,
    selectedCategories,
    selectedConcerns,
    selectedBrands,
    activeBrands,
    activeAyurvedicSubs,
    activeConcernSubs,
    filterCounts,
    content,
    filtered,
    sorted,
    activeFilterLabel: term ? `Search: ${term}` : selectedFacet || content.title,
    hasActiveFilters: Boolean(
      term ||
      selectedFacet ||
      selectedCategories.length > 0 ||
      selectedConcerns.length > 0 ||
      selectedBrands.length > 0,
    ),
    toggleCategory,
    toggleConcern,
    toggleBrand,
    selectBrandFacet,
    selectConcernFacet,
    clearAllFilters,
  };
}
