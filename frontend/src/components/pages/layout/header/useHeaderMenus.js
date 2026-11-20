"use client";
import { useState } from "react";

/**
 * Owns the header's interactive state: mobile drawer, mobile search bar,
 * search text, open mega menu and open mobile accordion section.
 * @param {object} options
 * @param {(view: string, searchTerm?: string) => void} options.openCatalog
 * @param {(query: string) => void} options.onSearch
 * @param {(page: string) => void} options.navigate
 * @returns {{
 *   mobile: boolean, setMobile: Function,
 *   searchOpen: boolean, setSearchOpen: Function,
 *   query: string, setQuery: Function,
 *   activeMegaMenu: string, setActiveMegaMenu: Function,
 *   mobileExpandedMenu: string,
 *   toggleMobileMenuSection: (menu: string) => void,
 *   navigateFromMobileMenu: (page: string) => void,
 *   selectCategory: (categoryName: string) => void,
 *   selectMobileBrand: (brand: string) => void,
 *   submitSearch: (event: Event) => void,
 * }}
 */
export function useHeaderMenus({ openCatalog, onSearch, navigate }) {
  const [mobile, setMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeMegaMenu, setActiveMegaMenu] = useState("");
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState("");

  const selectCategory = (categoryName) => {
    openCatalog("All Products", categoryName);
    setActiveMegaMenu("");
    setMobile(false);
    setMobileExpandedMenu("");
  };

  const selectMobileBrand = (brand) => {
    openCatalog("Brands", brand);
    setMobile(false);
  };

  const navigateFromMobileMenu = (page) => {
    navigate(page);
    setMobile(false);
  };

  const toggleMobileMenuSection = (menu) =>
    setMobileExpandedMenu(mobileExpandedMenu === menu ? "" : menu);

  const submitSearch = (event) => {
    event.preventDefault();
    onSearch(query);
    setSearchOpen(false);
  };

  return {
    mobile,
    setMobile,
    searchOpen,
    setSearchOpen,
    query,
    setQuery,
    activeMegaMenu,
    setActiveMegaMenu,
    mobileExpandedMenu,
    toggleMobileMenuSection,
    navigateFromMobileMenu,
    selectCategory,
    selectMobileBrand,
    submitSearch,
  };
}
