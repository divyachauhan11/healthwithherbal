"use client";
import { ChevronRight, X } from "lucide-react";
import { LOGO_URL } from "@/lib/store-data";
import { MobileBrandGrid } from "./MobileBrandGrid";
import { MobileCategoryGroups } from "./MobileCategoryGroups";
import { MobileMenuAccordion } from "./MobileMenuAccordion";

/**
 * Mobile navigation drawer with Home, Category, Brand and Blog entries.
 * @param {object} props
 * @param {() => void} props.onClose
 * @param {(page: string) => void} props.onNavigate Navigates and closes the drawer.
 * @param {""|"brand"|"category"} props.expandedMenu Open accordion section.
 * @param {(menu: "brand"|"category") => void} props.onToggleMenu
 * @param {Array<object>} props.categoryGroups
 * @param {string[]} props.brandNames
 * @param {(categoryName: string) => void} props.onSelectCategory
 * @param {(brand: string) => void} props.onSelectBrand
 */
export function MobileMenu({
  onClose,
  onNavigate,
  expandedMenu,
  onToggleMenu,
  categoryGroups,
  brandNames,
  onSelectCategory,
  onSelectBrand,
}) {
  return (
    <div className="mobile-menu">
      <div className="mobile-menu-head">
        <img
          src={LOGO_URL}
          alt="Health With Herbal"
          className="mobile-menu-logo"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X />
        </button>
      </div>

      <div className="mobile-menu-links">
        <button
          type="button"
          onClick={() => onNavigate("home")}
        >
          Home <ChevronRight size={18} />
        </button>

        <MobileMenuAccordion
          label="Category"
          expanded={expandedMenu === "category"}
          onToggle={() => onToggleMenu("category")}
        >
          <MobileCategoryGroups groups={categoryGroups} onSelect={onSelectCategory} />
        </MobileMenuAccordion>

        <MobileMenuAccordion
          label={<>Brand ({brandNames.length})</>}
          expanded={expandedMenu === "brand"}
          onToggle={() => onToggleMenu("brand")}
        >
          <MobileBrandGrid brands={brandNames} onSelect={onSelectBrand} />
        </MobileMenuAccordion>

        <button
          type="button"
          onClick={() => onNavigate("blog")}
        >
          Blog <ChevronRight size={18} />
        </button>

      </div>
    </div>
  );
}
