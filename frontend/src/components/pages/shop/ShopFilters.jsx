"use client";
import { FilterGroup } from "./FilterGroup";

/**
 * Shop filter sidebar: clear-all, search box and the category, concern and
 * brand filter groups.
 * @param {object} props
 * @param {string} props.term Search text.
 * @param {(value: string) => void} props.onTermChange
 * @param {() => void} props.onClearAll
 * @param {string[]} props.categoryOptions
 * @param {string[]} props.concernOptions
 * @param {string[]} props.brandOptions
 * @param {{catMap: object, concernMap: object, brandMap: object}} props.filterCounts
 * @param {string[]} props.selectedCategories
 * @param {string[]} props.selectedConcerns
 * @param {string[]} props.selectedBrands
 * @param {(category: string) => void} props.onToggleCategory
 * @param {(concern: string) => void} props.onToggleConcern
 * @param {(brand: string) => void} props.onToggleBrand
 */
export function ShopFilters({
  term,
  onTermChange,
  onClearAll,
  categoryOptions,
  concernOptions,
  brandOptions,
  filterCounts,
  selectedCategories,
  selectedConcerns,
  selectedBrands,
  onToggleCategory,
  onToggleConcern,
  onToggleBrand,
}) {
  return (
    <aside className="filters">
      <div className="filter-title">
        Filters{" "}
        <button type="button" onClick={onClearAll}>
          Clear all
        </button>
      </div>

      <label>
        Search products
        <input
          value={term}
          onChange={(event) => onTermChange(event.target.value)}
          placeholder="Search products or brands"
        />
      </label>

      {/* Category Filter (All Form Categories from Backend) */}
      <FilterGroup
        label="Category"
        options={categoryOptions}
        counts={filterCounts.catMap}
        selected={selectedCategories}
        onToggle={onToggleCategory}
      />

      {/* Shop by concern Filter (All Concern Categories from Backend - Uncapped) */}
      <FilterGroup
        label="Shop by concern"
        options={concernOptions}
        counts={filterCounts.concernMap}
        selected={selectedConcerns}
        onToggle={onToggleConcern}
      />

      {/* Brand Filter (All Brands from Backend - Uncapped) */}
      <FilterGroup
        label="Brand"
        options={brandOptions}
        counts={filterCounts.brandMap}
        selected={selectedBrands}
        onToggle={onToggleBrand}
      />
    </aside>
  );
}
