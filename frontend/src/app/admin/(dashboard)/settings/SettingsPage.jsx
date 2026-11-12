"use client";

import { useEffect, useState } from "react";
import { Settings, Plus, Trash2, Save, Megaphone, Pencil, X, Tags } from "lucide-react";
import { adminRequest } from "../../../../lib/admin-api";

export default function SettingsPage({ token }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [savingAnnouncements, setSavingAnnouncements] = useState(false);
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcementDraft, setAnnouncementDraft] = useState("");
  const [settingsSection, setSettingsSection] = useState("announcements");
  const [parentCategories, setParentCategories] = useState([]);
  const [featuredCategoryIds, setFeaturedCategoryIds] = useState([]);
  const [loadingFeaturedCategories, setLoadingFeaturedCategories] = useState(true);
  const [savingFeaturedCategories, setSavingFeaturedCategories] = useState(false);
  const [featuredCategoryMessage, setFeaturedCategoryMessage] = useState("");

  useEffect(() => {
    let active = true;
    adminRequest("/settings/announcements", { token })
      .then((data) => {
        if (active) setAnnouncements(Array.isArray(data.announcements) ? data.announcements : []);
      })
      .catch((error) => {
        if (active) setAnnouncementMessage(error.message || "Could not load announcements.");
      })
      .finally(() => { if (active) setLoadingAnnouncements(false); });
    return () => { active = false; };
  }, [token]);

  useEffect(() => {
    let active = true;
    adminRequest("/settings/featured-categories", { token })
      .then((data) => {
        if (!active) return;
        setParentCategories(Array.isArray(data.categories) ? data.categories : []);
        setFeaturedCategoryIds(Array.isArray(data.selectedIds) ? data.selectedIds.map(String) : []);
      })
      .catch((error) => {
        if (active) setFeaturedCategoryMessage(error.message || "Could not load featured categories.");
      })
      .finally(() => { if (active) setLoadingFeaturedCategories(false); });
    return () => { active = false; };
  }, [token]);

  const toggleFeaturedCategory = (id) => {
    const categoryId = String(id);
    setFeaturedCategoryIds((current) => current.includes(categoryId)
      ? current.filter((value) => value !== categoryId)
      : current.length < 4 ? [...current, categoryId] : current);
    setFeaturedCategoryMessage("");
  };

  const saveFeaturedCategories = async () => {
    setSavingFeaturedCategories(true);
    setFeaturedCategoryMessage("");
    try {
      const data = await adminRequest("/settings/featured-categories", {
        token,
        method: "PUT",
        body: { categoryIds: featuredCategoryIds },
      });
      setFeaturedCategoryIds(Array.isArray(data.selectedIds) ? data.selectedIds.map(String) : []);
      setFeaturedCategoryMessage("Homepage categories saved and published.");
    } catch (error) {
      setFeaturedCategoryMessage(error.message || "Could not save homepage categories.");
    } finally {
      setSavingFeaturedCategories(false);
    }
  };

  const persistAnnouncements = async (nextAnnouncements) => {
    setSavingAnnouncements(true);
    setAnnouncementMessage("");
    try {
      const data = await adminRequest("/settings/announcements", {
        token,
        method: "PUT",
        body: { announcements: nextAnnouncements },
      });
      setAnnouncements(data.announcements || []);
      setAnnouncementMessage("Announcements saved and published to the storefront.");
      setEditingAnnouncement(null);
      setAnnouncementDraft("");
    } catch (error) {
      setAnnouncementMessage(error.message || "Could not save announcements.");
    } finally {
      setSavingAnnouncements(false);
    }
  };

  const saveAnnouncement = () => {
    const value = announcementDraft.trim();
    if (!value) {
      setAnnouncementMessage("Enter announcement text before saving.");
      return;
    }
    const next = editingAnnouncement === "new"
      ? [...announcements, value]
      : announcements.map((item, index) => index === editingAnnouncement ? value : item);
    if (next.length > 12) {
      setAnnouncementMessage("You can add up to 12 announcements.");
      return;
    }
    persistAnnouncements(next);
  };

  const removeAnnouncement = (index) => {
    persistAnnouncements(announcements.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className="settings-dashboard">
      <section className="settings-header-banner">
        <div>
          <h2>
            <Settings size={26} /> Store Settings & Configuration
          </h2>
          <p>
            Admin access, security policies, and environment parameters for Health with Herbal.
          </p>
        </div>
        <div className="settings-header-meta">
          <div className="settings-live-badge">
            <span className="settings-live-dot" /> Live Storefront Connected
          </div>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
            Signed in as <b>{user?.email}</b>
          </span>
        </div>
      </section>

      <nav aria-label="Settings sections" style={{ display: "flex", gap: 10, borderBottom: "1px solid #e7e2dc", margin: "18px 0 22px", paddingBottom: 10, overflowX: "auto" }}>
        <button
          type="button"
          aria-current={settingsSection === "announcements" ? "page" : undefined}
          onClick={() => setSettingsSection("announcements")}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", border: 0, borderRadius: 8, padding: "10px 14px", cursor: "pointer", fontWeight: 700, background: settingsSection === "announcements" ? "var(--forest, #153a2f)" : "transparent", color: settingsSection === "announcements" ? "#fff" : "#52645d" }}
        >
          <Megaphone size={16} /> Announcement Bar
        </button>
        <button
          type="button"
          aria-current={settingsSection === "store" ? "page" : undefined}
          onClick={() => setSettingsSection("store")}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", border: 0, borderRadius: 8, padding: "10px 14px", cursor: "pointer", fontWeight: 700, background: settingsSection === "store" ? "var(--forest, #153a2f)" : "transparent", color: settingsSection === "store" ? "#fff" : "#52645d" }}
        >
          <Tags size={16} /> Featured parent categories
        </button>
      </nav>

      {settingsSection === "announcements" && <section className="settings-card announcement-settings-card">
        <div className="settings-card-header announcement-settings-heading">
          <div>
            <span className="settings-eyebrow"><Megaphone size={13} /> STOREFRONT CONTENT</span>
            <h3>Announcement Bar</h3>
            <p>Manage the messages shown in the scrolling bar above your storefront navigation.</p>
          </div>
          <button
            type="button"
            className="primary announcement-add-button"
            disabled={loadingAnnouncements || savingAnnouncements || announcements.length >= 12}
            onClick={() => { setEditingAnnouncement("new"); setAnnouncementDraft(""); setAnnouncementMessage(""); }}
          >
            <Plus size={16} /> Add announcement
          </button>
        </div>

        {announcementMessage && <p role="status" className="announcement-feedback">{announcementMessage}</p>}
        {loadingAnnouncements ? <p>Loading announcements…</p> : (
          <div className="announcement-table-wrap">
            <table className="announcement-table">
              <thead><tr><th scope="col">#</th><th scope="col">Announcement</th><th scope="col">Actions</th></tr></thead>
              <tbody>
                {editingAnnouncement === "new" && <tr>
                  <td>New</td>
                  <td><input autoFocus maxLength={180} value={announcementDraft} onChange={(event) => setAnnouncementDraft(event.target.value)} placeholder="Enter announcement text" aria-label="New announcement text" /></td>
                  <td className="announcement-row-actions">
                    <button type="button" disabled={savingAnnouncements} onClick={saveAnnouncement} aria-label="Save new announcement"><Save size={16} /></button>
                    <button type="button" onClick={() => setEditingAnnouncement(null)} aria-label="Cancel"><X size={16} /></button>
                  </td>
                </tr>}
                {announcements.map((announcement, index) => (
                  <tr key={`${index}-${announcement}`}>
                    <td>{String(index + 1).padStart(2, "0")}</td>
                    <td>{editingAnnouncement === index
                      ? <input autoFocus maxLength={180} value={announcementDraft} onChange={(event) => setAnnouncementDraft(event.target.value)} aria-label={`Edit announcement ${index + 1}`} />
                      : <span className="announcement-table-message">{announcement}</span>}
                    </td>
                    <td className="announcement-row-actions">
                      {editingAnnouncement === index ? <>
                        <button type="button" disabled={savingAnnouncements} onClick={saveAnnouncement} aria-label="Save announcement"><Save size={16} /></button>
                        <button type="button" onClick={() => setEditingAnnouncement(null)} aria-label="Cancel"><X size={16} /></button>
                      </> : <>
                        <button type="button" disabled={savingAnnouncements} onClick={() => { setEditingAnnouncement(index); setAnnouncementDraft(announcement); setAnnouncementMessage(""); }} aria-label={`Edit announcement ${index + 1}`}><Pencil size={16} /></button>
                        <button type="button" disabled={savingAnnouncements} onClick={() => removeAnnouncement(index)} aria-label={`Delete announcement ${index + 1}`}><Trash2 size={16} /></button>
                      </>}
                    </td>
                  </tr>
                ))}
                {announcements.length === 0 && editingAnnouncement !== "new" && <tr><td colSpan={3} className="announcement-empty">No announcements yet. Add one to show the announcement bar on your storefront.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <small className="announcement-help">Up to 12 messages, 180 characters each. Changes publish immediately after saving. Removing all announcements hides the bar.</small>
      </section>}

      {settingsSection === "store" && <section className="settings-card">
        <div className="settings-card-header" style={{ marginTop: 24 }}>
          <div>
            <span className="settings-eyebrow"><Tags size={13} /> HOMEPAGE DISPLAY</span>
            <h3>Featured parent categories</h3>
            <p>Choose the four active parent categories to show in the homepage category section.</p>
          </div>
          <button
            type="button"
            className="primary"
            onClick={saveFeaturedCategories}
            disabled={loadingFeaturedCategories || savingFeaturedCategories || featuredCategoryIds.length !== Math.min(4, parentCategories.length)}
          >
            <Save size={16} /> {savingFeaturedCategories ? "Saving…" : "Save selection"}
          </button>
        </div>
        {featuredCategoryMessage && <p role="status" className="announcement-feedback">{featuredCategoryMessage}</p>}
        {loadingFeaturedCategories ? <p>Loading parent categories…</p> : parentCategories.length === 0 ? (
          <p className="announcement-empty">Create active parent categories first to feature them on the homepage.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, margin: "14px 0 24px" }}>
            {parentCategories.map((category) => {
              const id = String(category._id);
              const checked = featuredCategoryIds.includes(id);
              return (
                <label key={id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 15px", border: `1px solid ${checked ? "#a85a37" : "#e7e2dc"}`, borderRadius: 10, background: checked ? "#fbf3ed" : "#fff", cursor: checked || featuredCategoryIds.length < 4 ? "pointer" : "not-allowed", opacity: !checked && featuredCategoryIds.length >= 4 ? 0.6 : 1 }}>
                  <input type="checkbox" checked={checked} onChange={() => toggleFeaturedCategory(id)} disabled={!checked && featuredCategoryIds.length >= 4} />
                  <span style={{ fontWeight: 650, color: "#402514" }}>{category.name}</span>
                </label>
              );
            })}
          </div>
        )}

      </section>}
    </div>
  );
}
