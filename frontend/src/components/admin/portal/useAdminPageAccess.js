"use client";

import { useEffect } from "react";
import { canViewAdminPage } from "./admin-portal-utils";

/**
 * Sends staff members away from pages they may not open, to their first
 * allowed page (or Products), clearing the search.
 * @param {{user: object|null, page: string, setPage: Function, setQuery: Function}} options
 */
export function useAdminPageAccess({ user, page, setPage, setQuery }) {
  useEffect(() => {
    if (!canViewAdminPage(user, page)) {
      setPage(user.pageAccess?.[0] || "Products");
      setQuery("");
    }
  }, [user, page, setPage, setQuery]);
}
