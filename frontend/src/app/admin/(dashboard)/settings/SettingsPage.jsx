"use client";

import { useEffect, useState } from "react";
import { Settings, ShieldCheck, Database, CheckCircle2, ArrowRight, Plus, Trash2, Save, Megaphone, Pencil, X } from "lucide-react";
import { adminRequest } from "../../../../lib/admin-api";

export default function SettingsPage({ user, token, onNavigate }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [savingAnnouncements, setSavingAnnouncements] = useState(false);
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcementDraft, setAnnouncementDraft] = useState("");
  const [settingsSection, setSettingsSection] = useState("announcements");

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
          <Settings size={16} /> Store Configuration
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
        <div className="settings-card-header">
          <div>
            <span className="settings-eyebrow">
              <ShieldCheck size={13} /> SECURITY & ACCESS
            </span>
            <h3>Store Configuration</h3>
            <p>
              Admin credentials and database connections are controlled by server-side environment variables.
            </p>
          </div>
        </div>

        <div className="settings-system-grid">
          <div className="settings-system-box">
            <strong>Administrator Account</strong>
            <p>{user?.email || "admin@healthwithherbal.com"}</p>
            <div style={{ marginTop: "10px", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#059669", fontWeight: 600 }}>
              <CheckCircle2 size={14} /> Full Access Role
            </div>
          </div>

          <div className="settings-system-box">
            <strong>Database Connection</strong>
            <p>MongoDB Atlas Cluster connected with automated index synchronization.</p>
            <div style={{ marginTop: "10px", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#059669", fontWeight: 600 }}>
              <Database size={14} /> Active & Operational
            </div>
          </div>

          <div className="settings-system-box">
            <strong>Product Badges & New Launches</strong>
            <p>
              To feature a product in the storefront <b>New launches</b> section, simply set its <b>Badge (Tag)</b> to <b>&ldquo;New&rdquo;</b> when creating or editing a product in the Products tab.
            </p>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate("Products")}
                style={{
                  marginTop: "10px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: "var(--forest, #153a2f)",
                  fontWeight: 700,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Go to Products <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      </section>}
    </div>
  );
}
