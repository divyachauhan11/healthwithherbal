"use client";
import { MegaMenuBrandLinks } from "./MegaMenuBrandLinks";
import { MegaMenuCategoryColumns } from "./MegaMenuCategoryColumns";

/**
 * Desktop mega menu listing brands or category groups.
 * @param {object} props
 * @param {"brand"|"category"} props.activeMegaMenu Which menu is open.
 * @param {Function} props.setActiveMegaMenu Mega-menu state setter.
 * @param {string[]} props.brandNames
 * @param {Array<object>} props.categoryGroups
 * @param {Array<Array<object>>} props.categoryColumns `categoryGroups` balanced into columns.
 * @param {(view: string, searchTerm?: string) => void} props.openCatalog
 * @param {(categoryName: string) => void} props.onSelectCategory
 */
export function MegaMenu({
  activeMegaMenu,
  setActiveMegaMenu,
  brandNames,
  categoryGroups,
  categoryColumns,
  openCatalog,
  onSelectCategory,
}) {
  return (
    <div
      className="header-mega-menu"
      onMouseEnter={() =>
        setActiveMegaMenu((current) => current || "category")
      }
    >
      <div className="header-mega-menu-heading">
        <span>{activeMegaMenu === "brand" ? "Shop by brand" : "Shop by category"}</span>
      </div>
      {activeMegaMenu === "brand" ? (
        <div className="header-mega-link-list">
          <MegaMenuBrandLinks
            brands={brandNames}
            onHover={() => setActiveMegaMenu("brand")}
            onSelect={(brand) => {
              openCatalog("Brands", brand);
              setActiveMegaMenu("");
            }}
          />
        </div>
      ) : categoryGroups.length ? (
        <div className="header-category-mega-grid">
          <MegaMenuCategoryColumns
            columns={categoryColumns}
            onHover={() => setActiveMegaMenu("category")}
            onSelect={onSelectCategory}
          />
        </div>
      ) : <p className="header-mega-empty">No categories available.</p>}
    </div>
  );
}
