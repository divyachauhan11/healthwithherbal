"use client";

import { CatalogHeading } from "@/components/pages/shared/CatalogHeading";
import { ProductGrid } from "@/components/pages/shared/ProductGrid";
import {
  FacetDirectory,
  ShopEmptyState,
  ShopFilters,
  ShopResultsToolbar,
  useShopCatalog,
  useShopFilters,
} from "@/components/pages/shop";

const shopProductId = (product) => product.id || product._id;

/**
 * Catalogue page: heading, brand/concern facets, filter sidebar, results
 * toolbar and the filtered product grid.
 * @param {object} props
 * @param {Array<string|number>} props.wished
 * @param {Array<string|number>} props.cart
 * @param {(id: string|number) => void} props.onWish
 * @param {(id: string|number) => void} props.onAdd
 * @param {(id: string|number) => void} props.openProduct
 * @param {string} [props.view] Catalogue view ("All Products", "Brands", "Shop by Concern" or a category/brand).
 * @param {string} [props.initialTerm] Initial search text.
 * @param {(view: string) => void} [props.openCatalog]
 * @param {Array<object>} [props.products]
 * @param {Array<object>} [props.categories]
 * @param {Array<object>} [props.brands]
 */
export function ShopPage({
  wished,
  cart,
  onWish,
  onAdd,
  openProduct,
  view,
  initialTerm,
  openCatalog,
  products: productsProp = [],
  categories: categoriesProp = [],
  brands: brandsProp = [],
}) {
  const catalog = useShopCatalog({
    products: productsProp,
    categories: categoriesProp,
    brands: brandsProp,
  });
  const filters = useShopFilters({ view, initialTerm, ...catalog });

  return (
    <main className="shop-page page-width">
      <CatalogHeading
        eyebrow={filters.content.eyebrow}
        title={filters.content.title}
        copy={filters.content.copy}
      >
        {filters.filtered.length} products
      </CatalogHeading>

      {/* Top Brands Directory Pills */}
      {view === "Brands" && (
        <FacetDirectory
          className="brand-directory"
          options={filters.activeBrands}
          selected={filters.selectedFacet}
          onSelect={filters.selectBrandFacet}
        />
      )}

      {/* Top Concerns Directory Pills */}
      {view === "Shop by Concern" && (
        <FacetDirectory
          className="brand-directory concern-directory"
          options={filters.activeConcernSubs}
          selected={filters.selectedFacet}
          onSelect={filters.selectConcernFacet}
        />
      )}

      <div className="shop-layout">
        <ShopFilters
          term={filters.term}
          onTermChange={filters.setTerm}
          onClearAll={filters.clearAllFilters}
          categoryOptions={filters.activeAyurvedicSubs}
          concernOptions={filters.activeConcernSubs}
          brandOptions={filters.activeBrands}
          filterCounts={filters.filterCounts}
          selectedCategories={filters.selectedCategories}
          selectedConcerns={filters.selectedConcerns}
          selectedBrands={filters.selectedBrands}
          onToggleCategory={filters.toggleCategory}
          onToggleConcern={filters.toggleConcern}
          onToggleBrand={filters.toggleBrand}
        />

        <section className="shop-results">
          <ShopResultsToolbar
            label={filters.activeFilterLabel}
            showClear={filters.hasActiveFilters}
            onClear={filters.clearAllFilters}
            sort={filters.sort}
            onSortChange={filters.setSort}
          />

          <ProductGrid
            className="shop-products"
            products={filters.sorted}
            getId={shopProductId}
            wished={wished}
            cart={cart}
            onWish={onWish}
            onAdd={onAdd}
            openProduct={openProduct}
            openCatalog={openCatalog}
          >
            {!filters.sorted.length && (
              <ShopEmptyState onReset={filters.clearAllFilters} />
            )}
          </ProductGrid>
        </section>
      </div>
    </main>
  );
}

export default ShopPage;
