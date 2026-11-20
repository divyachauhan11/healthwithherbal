"use client";
import {
  BestsellersSection,
  BrandsSliderSection,
  ConcernsSection,
  FeaturedCategories,
  HerbalShelfSection,
  HomeHero,
  NewLaunchesSection,
  StorySection,
  TrustStrip,
  WhyHealthWithHerbal,
  useHomeProducts,
} from "@/components/pages/sections/home";

/**
 * Storefront home page, assembled from the home sections.
 * @param {object} props
 * @param {(view: string, searchTerm?: string) => void} props.openCatalog
 * @param {(page: string) => void} props.openContent
 * @param {(id: string|number) => void} props.onAdd
 * @param {Array<string|number>} props.cart
 * @param {Array<string|number>} props.wished
 * @param {(id: string|number) => void} props.onWish
 * @param {(id: string|number) => void} props.openProduct
 * @param {Array<object>} [props.products]
 * @param {Array<object>} [props.categories]
 * @param {Array<object>} [props.navigationCategories]
 * @param {Array<string>} [props.featuredCategoryIds]
 * @param {Array<object>} [props.brands]
 */
export function HomePage({
  openCatalog,
  openContent,
  onAdd,
  cart,
  wished,
  onWish,
  openProduct,
  products = [],
  categories = [],
  navigationCategories = [],
  featuredCategoryIds = [],
  brands = [],
}) {
  const {
    shelf,
    setShelf,
    shelfProducts,
    bestsellerProducts,
    featuredCategories,
    displayedConcerns,
  } = useHomeProducts({ products, categories, navigationCategories, featuredCategoryIds });
  const productActions = { wished, cart, onWish, onAdd, openProduct, openCatalog };

  return (
    <main>
      <HomeHero openCatalog={openCatalog} openContent={openContent} />

      <TrustStrip />

      <FeaturedCategories categories={featuredCategories} openCatalog={openCatalog} />

      <BestsellersSection products={bestsellerProducts} {...productActions} />

      {/* NEW LAUNCHES SECTION */}
      <NewLaunchesSection
        onAdd={onAdd}
        onWish={onWish}
        wished={wished}
        cart={cart}
        openProduct={openProduct}
        openCatalog={openCatalog}
        products={products}
      />

      {/* SUPPORT FOR THE WAY YOU FEEL */}
      {displayedConcerns.length > 0 && (
        <ConcernsSection concerns={displayedConcerns} openCatalog={openCatalog} />
      )}

      <StorySection openContent={openContent} />

      <HerbalShelfSection
        shelf={shelf}
        onShelfChange={setShelf}
        products={shelfProducts}
        {...productActions}
      />

      {/* Brands We Trust Section */}
      <BrandsSliderSection openCatalog={openCatalog} brands={brands} />

      {/* Why Health with Herbal Section */}
      <WhyHealthWithHerbal />
    </main>
  );
}
