"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchAdminCatalog,
  fetchAdminDashboard,
  fetchAdminPageData,
  isAdminSessionError,
} from "../../../lib/admin-api";
import { ADMIN_PAGE_IDS } from "../../../constants/admin-pages";
import { filterAdminRows } from "./admin-portal-utils";

/**
 * Owns the data shown by admin pages: per-page lists/stats, the brand and
 * category catalog, and the loading flag. Loads the active page whenever the
 * session, page or product category scope changes, prefetches dashboard stats
 * for the header, and filters the page rows by the search query.
 * @param {object} options
 * @param {string} options.token Admin token.
 * @param {string} options.page Active page.
 * @param {string} options.query Search query.
 * @param {{id: string}|null} options.productCategoryScope Parent category filter of the products page.
 * @param {(message: string, type?: string) => void} options.notify
 * @param {(message: string) => void} options.onSessionExpired Called when a load fails because the session ended.
 * @returns {{
 *   data: object, setData: Function, catalog: {brands: Array, categories: Array},
 *   loading: boolean, load: (target?: string, activeToken?: string) => Promise<void>, filtered: Array,
 * }}
 */
export function useAdminPageData({
  token,
  page,
  query,
  productCategoryScope,
  notify,
  onSessionExpired,
}) {
  const [data, setData] = useState({});
  const [catalog, setCatalog] = useState({ brands: [], categories: [] });
  const [loading, setLoading] = useState(false);

  const load = async (target = page, activeToken = token) => {
    if (!activeToken) return;
    setLoading(true);
    try {
      if ([ADMIN_PAGE_IDS.SETTINGS, ADMIN_PAGE_IDS.PROFILE].includes(target)) {
        setLoading(false);
        return;
      }
      const pageData = await fetchAdminPageData(target, {
        token: activeToken,
        parentCategoryId: productCategoryScope?.id,
      });
      setData((current) => ({
        ...current,
        [target]: pageData,
      }));
      if ([
        ADMIN_PAGE_IDS.PRODUCTS,
        ADMIN_PAGE_IDS.CATEGORIES,
        ADMIN_PAGE_IDS.BRANDS,
        ADMIN_PAGE_IDS.LOW_STOCK,
      ].includes(target)) {
        setCatalog(await fetchAdminCatalog(activeToken));
      }
      if (target !== "Dashboard" && !data.Dashboard) {
        fetchAdminDashboard(activeToken)
          .then((dashResult) => {
            setData((cur) => ({
              ...cur,
              Dashboard: dashResult,
            }));
          })
          .catch((error) => {
            // The dashboard is prefetched for header stats; the page itself still works.
            console.warn("Could not prefetch dashboard stats:", error.message);
          });
      }
    } catch (error) {
      if (isAdminSessionError(error)) {
        onSessionExpired(error.message || "Your admin session expired. Sign in again to continue.");
      }
      notify(error.message || "Could not load this admin page. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) load(page, token);
    // Reload only when the session, page or product scope changes; `load` is
    // recreated every render and reads the latest values itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, productCategoryScope]);

  const filtered = useMemo(() => filterAdminRows(data, page, query), [data, page, query]);

  return { data, setData, catalog, loading, load, filtered };
}
