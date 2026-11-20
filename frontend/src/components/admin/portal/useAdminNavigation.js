"use client";

import { useState } from "react";
import { ADMIN_PAGE_IDS } from "../../../constants/admin-pages";
import { getStoredAdminPage, getStoredAdminQuery } from "../../../lib/session";
import { getValidPageName } from "./admin-portal-utils";

/** Page from `?page=`/`?tab=`, else the remembered page, else Dashboard. */
function readInitialPage() {
  if (typeof window === "undefined") return ADMIN_PAGE_IDS.DASHBOARD;
  try {
    const params = new URLSearchParams(window.location.search);
    const paramPage = params.get("page") || params.get("tab");
    const validParam = getValidPageName(paramPage);
    if (validParam) return validParam;

    const saved = getStoredAdminPage();
    const validSaved = getValidPageName(saved);
    if (validSaved) return validSaved;
  } catch {
    // Ignore
  }
  return "Dashboard";
}

/** Search query from `?q=`/`?query=`, else the remembered query. */
function readInitialQuery() {
  if (typeof window === "undefined") return "";
  try {
    const params = new URLSearchParams(window.location.search);
    return (
      params.get("q") ||
      params.get("query") ||
      getStoredAdminQuery() ||
      ""
    );
  } catch {
    return "";
  }
}

/**
 * Owns the portal's navigation state: active page and search query (initialised
 * from the URL, then from storage), the mobile sidebar, and the parent category
 * scope of the products page.
 * @returns {{
 *   page: string, setPage: Function, query: string, setQuery: Function,
 *   sidebarOpen: boolean, setSidebarOpen: Function,
 *   productCategoryScope: {id: string, name: string}|null, setProductCategoryScope: Function,
 *   navigateTo: (targetPage: string, filterQuery?: string|{parentCategoryId: string, parentCategoryName?: string}) => void,
 *   resetNavigation: () => void,
 * }}
 */
export function useAdminNavigation() {
  const [page, setPage] = useState(readInitialPage);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState(readInitialQuery);
  const [productCategoryScope, setProductCategoryScope] = useState(null);

  /** Open a page, optionally filtered by a query or scoped to a parent category (products). */
  const navigateTo = (targetPage, filterQuery) => {
    setPage(targetPage);
    if (targetPage === "Products" && filterQuery?.parentCategoryId) {
      setProductCategoryScope({
        id: filterQuery.parentCategoryId,
        name: filterQuery.parentCategoryName || "Parent category",
      });
      setQuery("");
    } else {
      setProductCategoryScope(null);
      if (filterQuery !== undefined) setQuery(filterQuery);
    }
  };

  /** Back to the unfiltered dashboard (after sign-out). */
  const resetNavigation = () => {
    setPage(ADMIN_PAGE_IDS.DASHBOARD);
    setQuery("");
    setProductCategoryScope(null);
  };

  return {
    page,
    setPage,
    query,
    setQuery,
    sidebarOpen,
    setSidebarOpen,
    productCategoryScope,
    setProductCategoryScope,
    navigateTo,
    resetNavigation,
  };
}
