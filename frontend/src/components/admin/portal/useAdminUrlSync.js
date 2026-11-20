"use client";

import { useEffect } from "react";
import { saveAdminPortalState } from "../../../lib/session";
import { getValidPageName, normalizePageKey } from "./admin-portal-utils";

/**
 * Mirrors the active page and search query into the URL (`?page=&q=`) and
 * storage, and follows browser back/forward navigation.
 * @param {{page: string, query: string, setPage: Function, setQuery: Function}} options
 */
export function useAdminUrlSync({ page, query, setPage, setQuery }) {
  // Synchronize active page and search query to URL and localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      saveAdminPortalState(page, query.trim());

      const params = new URLSearchParams(window.location.search);
      const slugPage = normalizePageKey(page);
      params.set("page", slugPage);
      if (query.trim()) {
        params.set("q", query.trim());
      } else {
        params.delete("q");
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, "", newUrl);
    } catch {
      // Ignore storage/history exceptions if any
    }
  }, [page, query]);

  // Handle browser back and forward navigation
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlPage = getValidPageName(params.get("page") || params.get("tab"));
        if (urlPage && urlPage !== page) {
          setPage(urlPage);
        }
        const urlQuery = params.get("q") || params.get("query") || "";
        if (urlQuery !== query) {
          setQuery(urlQuery);
        }
      } catch {
        // Ignore
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [page, query, setPage, setQuery]);
}
