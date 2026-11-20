"use client";

import { useEffect, useState } from "react";
import { fetchAdminAnnouncements, saveAdminAnnouncements } from "@/lib/admin-api";
import { MAX_ANNOUNCEMENTS, applyAnnouncementEdit } from "./settings-utils";

/**
 * Owns the storefront announcement list: loading, inline add/edit drafts, saving and
 * the pending delete confirmation. Every change is saved (published) immediately.
 * @param {string} token Admin session token.
 * @returns {{
 *   announcements: string[], loading: boolean, saving: boolean, message: string,
 *   editing: "new"|number|null, draft: string, setDraft: Function, pendingDelete: number|null,
 *   startAdding: Function, startEditing: (row: {index: number, announcement: string}) => void,
 *   cancelEditing: Function, saveDraft: Function, requestDelete: (index: number) => void,
 *   cancelDelete: Function, confirmDelete: Function
 * }}
 */
export function useAnnouncementSettings(token) {
  const [announcements, setAnnouncements] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    let active = true;
    fetchAdminAnnouncements(token)
      .then((data) => {
        if (active) setAnnouncements(Array.isArray(data.announcements) ? data.announcements : []);
      })
      .catch((error) => {
        if (active) setMessage(error.message || "Could not load announcements.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  const persist = async (nextAnnouncements) => {
    setSaving(true);
    setMessage("");
    try {
      const data = await saveAdminAnnouncements({ announcements: nextAnnouncements }, token);
      setAnnouncements(data.announcements || []);
      setMessage("Announcements saved and published to the storefront.");
      setEditing(null);
      setDraft("");
    } catch (error) {
      setMessage(error.message || "Could not save announcements.");
    } finally {
      setSaving(false);
    }
  };

  const saveDraft = () => {
    const value = draft.trim();
    if (!value) {
      setMessage("Enter announcement text before saving.");
      return;
    }
    const next = applyAnnouncementEdit(announcements, editing, value);
    if (next.length > MAX_ANNOUNCEMENTS) {
      setMessage("You can add up to 12 announcements.");
      return;
    }
    persist(next);
  };

  const remove = (index) => {
    persist(announcements.filter((_, itemIndex) => itemIndex !== index));
  };

  const startAdding = () => { setEditing("new"); setDraft(""); setMessage(""); };
  const startEditing = (row) => { setEditing(row.index); setDraft(row.announcement); setMessage(""); };
  const cancelEditing = () => setEditing(null);
  const requestDelete = (index) => setPendingDelete(index);
  const cancelDelete = () => setPendingDelete(null);
  const confirmDelete = () => {
    if (pendingDelete !== null) {
      remove(pendingDelete);
      setPendingDelete(null);
    }
  };

  return {
    announcements,
    loading,
    saving,
    message,
    editing,
    draft,
    setDraft,
    pendingDelete,
    startAdding,
    startEditing,
    cancelEditing,
    saveDraft,
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
}
