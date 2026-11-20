"use client";
import { MainNavLink } from "./MainNavLink";
import { MegaMenu } from "./MegaMenu";
import { NavDropdownTrigger } from "./NavDropdownTrigger";

/**
 * Desktop main navigation (Home, Category, Brand, Blog) with its mega menu.
 * The menu closes when the pointer leaves the navigation or on Escape.
 * @param {object} props
 * @param {string} props.currentPage Active storefront page.
 * @param {""|"brand"|"category"} props.activeMegaMenu
 * @param {Function} props.setActiveMegaMenu Mega-menu state setter.
 * @param {(page: string) => void} props.navigate
 * @param {(view: string, searchTerm?: string) => void} props.openCatalog
 * @param {string[]} props.brandNames
 * @param {Array<object>} props.categoryGroups
 * @param {Array<Array<object>>} props.categoryColumns
 * @param {(categoryName: string) => void} props.onSelectCategory
 */
export function MainNav({
  currentPage,
  activeMegaMenu,
  setActiveMegaMenu,
  navigate,
  openCatalog,
  brandNames,
  categoryGroups,
  categoryColumns,
  onSelectCategory,
}) {
  return (
    <nav
      className="main-nav"
      onMouseLeave={() => setActiveMegaMenu("")}
      onKeyDown={(event) => {
        if (event.key === "Escape") setActiveMegaMenu("");
      }}
    >
      <div className="page-width">
        <MainNavLink
          label="Home"
          active={currentPage === "home"}
          onMouseEnter={() => setActiveMegaMenu("")}
          onClick={() => navigate("home")}
        />

        <NavDropdownTrigger
          label="Category"
          open={activeMegaMenu === "category"}
          onOpen={() => setActiveMegaMenu("category")}
          onClick={() => setActiveMegaMenu("category")}
        />

        <NavDropdownTrigger
          label="Brand"
          open={activeMegaMenu === "brand"}
          onOpen={() => setActiveMegaMenu("brand")}
          onClick={() => {
            openCatalog("Brands");
            setActiveMegaMenu("");
          }}
        />

        <MainNavLink
          label="Blog"
          active={currentPage === "blog"}
          onMouseEnter={() => setActiveMegaMenu("")}
          onClick={() => navigate("blog")}
        />

        {activeMegaMenu && (
          <MegaMenu
            activeMegaMenu={activeMegaMenu}
            setActiveMegaMenu={setActiveMegaMenu}
            brandNames={brandNames}
            categoryGroups={categoryGroups}
            categoryColumns={categoryColumns}
            openCatalog={openCatalog}
            onSelectCategory={onSelectCategory}
          />
        )}
      </div>
    </nav>
  );
}
