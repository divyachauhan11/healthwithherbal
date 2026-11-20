"use client";
import { AnnouncementMarquee } from "@/components/pages/layout/AnnouncementMarquee";
import {
  HeaderActions,
  HeaderLogo,
  HeaderSearchForm,
  MainNav,
  MobileMenu,
  MobileMenuTrigger,
  balanceCategoryColumns,
  getBrandNames,
  getMenuCategories,
  groupCategoriesByParent,
  useHeaderMenus,
} from "./header";

/**
 * Storefront header: announcement marquee, logo, search, account/wishlist/bag
 * actions, desktop navigation with mega menus and the mobile menu drawer.
 * @param {object} props
 * @param {number} props.cartCount
 * @param {number} props.wishlistCount
 * @param {(page: string) => void} props.navigate
 * @param {(view: string, searchTerm?: string) => void} props.openCatalog
 * @param {string} props.currentPage Active storefront page.
 * @param {() => void} props.openCart
 * @param {() => void} props.openAuthModal
 * @param {object|null} props.currentUser
 * @param {(query: string) => void} props.onSearch
 * @param {Array<object|string>} [props.categories]
 * @param {Array<object|string>} [props.navigationCategories]
 * @param {Array<object|string>} [props.brands]
 * @param {string[]} [props.announcements]
 */
export function Header({
  cartCount,
  wishlistCount,
  navigate,
  openCatalog,
  currentPage,
  openCart,
  openAuthModal,
  currentUser,
  onSearch,
  categories = [],
  navigationCategories: navigationCategoriesProp = [],
  brands: brandsProp = [],
  announcements = [],
}) {
  const menus = useHeaderMenus({ openCatalog, onSearch, navigate });
  const activeBrands = getBrandNames(brandsProp);
  const categoryGroups = groupCategoriesByParent(
    getMenuCategories(navigationCategoriesProp, categories),
  );
  const categoryColumns = balanceCategoryColumns(categoryGroups);

  return (
    <>
      <AnnouncementMarquee announcements={announcements} />

      <header className="site-header">
        <div className="header-main page-width">
          <MobileMenuTrigger onClick={() => menus.setMobile(true)} />

          <HeaderLogo onClick={() => navigate("home")} />

          <HeaderSearchForm
            className="header-search"
            placeholder="Search remedies, brands, concerns..."
            query={menus.query}
            onQueryChange={menus.setQuery}
            onSubmit={menus.submitSearch}
          >
            <button type="submit">Search</button>
          </HeaderSearchForm>

          <HeaderActions
            currentUser={currentUser}
            wishlistCount={wishlistCount}
            cartCount={cartCount}
            onToggleSearch={() => menus.setSearchOpen(!menus.searchOpen)}
            onAccount={() => {
              if (currentUser) {
                navigate("account");
              } else {
                openAuthModal();
              }
            }}
            onWishlist={() => navigate("wishlist")}
            onBag={openCart}
          />
        </div>

        {menus.searchOpen && (
          <HeaderSearchForm
            className="mobile-searchbar"
            autoFocus
            placeholder="Search herbal wellness..."
            query={menus.query}
            onQueryChange={menus.setQuery}
            onSubmit={menus.submitSearch}
          />
        )}

        <MainNav
          currentPage={currentPage}
          activeMegaMenu={menus.activeMegaMenu}
          setActiveMegaMenu={menus.setActiveMegaMenu}
          navigate={navigate}
          openCatalog={openCatalog}
          brandNames={activeBrands}
          categoryGroups={categoryGroups}
          categoryColumns={categoryColumns}
          onSelectCategory={menus.selectCategory}
        />
      </header>

      {menus.mobile && (
        <MobileMenu
          onClose={() => menus.setMobile(false)}
          onNavigate={menus.navigateFromMobileMenu}
          expandedMenu={menus.mobileExpandedMenu}
          onToggleMenu={menus.toggleMobileMenuSection}
          categoryGroups={categoryGroups}
          brandNames={activeBrands}
          onSelectCategory={menus.selectCategory}
          onSelectBrand={menus.selectMobileBrand}
        />
      )}
    </>
  );
}
