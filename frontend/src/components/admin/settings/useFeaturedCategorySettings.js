"use client";

import { useEffect, useState } from "react";
import { fetchAdminFeaturedCategories, saveAdminFeaturedCategories } from "@/lib/admin-api";
import { FEATURED_CATEGORY_LIMIT, toIdStrings } from "./settings-utils";

/**
 * Loads the active parent categories and the selection featured on the homepage, and
 * saves a new selection (at most {@link FEATURED_CATEGORY_LIMIT} categories).
 * @param {string} token Admin session token.
 * @returns {{
 *   parentCategories: Array<object>, selectedIds: string[], loading: boolean, saving: boolean,
 *   message: string, toggle: (id: string) => void, save: () => Promise<void>
 * }}
 */
export function useFeaturedCategorySettings(token) {
  const [parentCategories, setParentCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    fetchAdminFeaturedCategories(token)
      .then((data) => {
        if (!active) return;
        setParentCategories(Array.isArray(data.categories) ? data.categories : []);
        setSelectedIds(toIdStrings(data.selectedIds));
      })
      .catch((error) => {
        if (active) setMessage(error.message || "Could not load featured categories.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  const toggle = (id) => {
    const categoryId = String(id);
    setSelectedIds((current) => current.includes(categoryId)
      ? current.filter((value) => value !== categoryId)
      : current.length < FEATURED_CATEGORY_LIMIT ? [...current, categoryId] : current);
    setMessage("");
  };

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const data = await saveAdminFeaturedCategories({ categoryIds: selectedIds }, token);
      setSelectedIds(toIdStrings(data.selectedIds));
      setMessage("Homepage categories saved and published.");
    } catch (error) {
      setMessage(error.message || "Could not save homepage categories.");
    } finally {
      setSaving(false);
    }
  };

  return { parentCategories, selectedIds, loading, saving, message, toggle, save };
}
