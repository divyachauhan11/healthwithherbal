"use client";

import { useEffect, useState } from "react";
import { Settings, Plus, Trash2, Save, Megaphone, Pencil, X, Tags, RotateCcw } from "lucide-react";
import { adminRequest } from "@/lib/admin-api";
import { DataTable } from "@/components/admin/tables";
import { DashboardPanel } from "@/components/admin/dashboard";
import { ConfirmModal } from "@/components/pages/modals/ConfirmModal";

export default function SettingsPage({ token, user }) {
  const [announcements, setAnnouncements] = useState([]);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
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
  const [returnExchangeEnabled, setReturnExchangeEnabled] = useState(true);
  const [loadingReturnExchange, setLoadingReturnExchange] = useState(true);
  const [savingReturnExchange, setSavingReturnExchange] = useState(false);
  const [returnExchangeMessage, setReturnExchangeMessage] = useState("");

  useEffect(() => {
    let active = true;
    adminRequest("/settings/return-exchange", { token })
      .then((data) => { if (active) setReturnExchangeEnabled(data.enabled !== false); })
      .catch((error) => { if (active) setReturnExchangeMessage(error.message || "Could not load this setting."); })
      .finally(() => { if (active) setLoadingReturnExchange(false); });
    return () => { active = false; };
  }, [token]);

  const saveReturnExchange = async (enabled) => {
    setSavingReturnExchange(true);
    setReturnExchangeMessage("");
    try {
      const data = await adminRequest("/settings/return-exchange", { token, method: "PUT", body: { enabled } });
      setReturnExchangeEnabled(data.enabled);
      setReturnExchangeMessage(data.enabled
        ? "Online return and exchange requests are enabled."
        : "Online requests are disabled. Customers will be directed to email support.");
      window.dispatchEvent(new CustomEvent("hwh-return-exchange-setting", { detail: { enabled: data.enabled } }));
    } catch (error) { setReturnExchangeMessage(error.message || "Could not save this setting."); }
    finally { setSavingReturnExchange(false); }
  };

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
          aria-current={settingsSection === "returns" ? "page" : undefined}
          onClick={() => setSettingsSection("returns")}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", border: 0, borderRadius: 8, padding: "10px 14px", cursor: "pointer", fontWeight: 700, background: settingsSection === "returns" ? "var(--forest, #153a2f)" : "transparent", color: settingsSection === "returns" ? "#fff" : "#52645d" }}
        >
          <RotateCcw size={16} /> Returns & Exchanges
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

      {settingsSection === "announcements" && <DashboardPanel
        title={<><span className="settings-eyebrow"><Megaphone size={13} /> STOREFRONT CONTENT</span><br />Announcement Bar</>}
        description="Manage the messages shown in the scrolling bar above your storefront navigation."
        className="settings-card announcement-settings-card"
        action={<button
            type="button"
            className="primary announcement-add-button"
            disabled={loadingAnnouncements || savingAnnouncements || announcements.length >= 12}
            onClick={() => { setEditingAnnouncement("new"); setAnnouncementDraft(""); setAnnouncementMessage(""); }}
          >
            <Plus size={16} /> Add announcement
          </button>}
      >
        {announcementMessage && <p role="status" className="announcement-feedback">{announcementMessage}</p>}
        {loadingAnnouncements ? <p>Loading announcements…</p> : (
          <div className="announcement-table-wrap">
            <DataTable
              data={[
                ...(editingAnnouncement === "new" ? [{ id: "new", isNew: true, announcement: "" }] : []),
                ...announcements.map((announcement, index) => ({
                  id: `${index}-${announcement}`,
                  index,
                  announcement,
                })),
              ]}
              rowKey="id"
              pagination={false}
              tableClassName="announcement-table"
              emptyState={announcements.length === 0 && editingAnnouncement !== "new" ? (
                <div className="announcement-empty">
                  No announcements yet. Add one to show the announcement bar on your storefront.
                </div>
              ) : null}
              columns={[
                {
                  key: "index",
                  label: "#",
                  render: (row) => row.isNew ? "New" : String(row.index + 1).padStart(2, "0"),
                },
                {
                  key: "announcement",
                  label: "Announcement",
                  render: (row) => row.isNew || editingAnnouncement === row.index ? (
                    <input
                      autoFocus
                      maxLength={180}
                      value={announcementDraft}
                      onChange={(event) => setAnnouncementDraft(event.target.value)}
                      placeholder={row.isNew ? "Enter announcement text" : undefined}
                      aria-label={row.isNew ? "New announcement text" : `Edit announcement ${row.index + 1}`}
                    />
                  ) : (
                    <span className="announcement-table-message">{row.announcement}</span>
                  ),
                },
                {
                  key: "actions",
                  label: "Actions",
                  cellClassName: "announcement-row-actions",
                  render: (row) => row.isNew || editingAnnouncement === row.index ? (
                    <>
                      <button type="button" disabled={savingAnnouncements} onClick={saveAnnouncement} aria-label={row.isNew ? "Save new announcement" : "Save announcement"}><Save size={16} /></button>
                      <button type="button" onClick={() => setEditingAnnouncement(null)} aria-label="Cancel"><X size={16} /></button>
                    </>
                  ) : (
                    <>
                      <button type="button" disabled={savingAnnouncements} onClick={() => { setEditingAnnouncement(row.index); setAnnouncementDraft(row.announcement); setAnnouncementMessage(""); }} aria-label={`Edit announcement ${row.index + 1}`}><Pencil size={16} /></button>
                      <button type="button" disabled={savingAnnouncements} onClick={() => setAnnouncementToDelete(row.index)} aria-label={`Delete announcement ${row.index + 1}`}><Trash2 size={16} /></button>
                    </>
                  ),
                },
              ]}
            />
          </div>
        )}
        <small className="announcement-help">Up to 12 messages, 180 characters each. Changes publish immediately after saving. Removing all announcements hides the bar.</small>
      </DashboardPanel>}

      {settingsSection === "store" && <DashboardPanel
        title={<><span className="settings-eyebrow"><Tags size={13} /> HOMEPAGE DISPLAY</span><br />Featured parent categories</>}
        description="Choose the four active parent categories to show in the homepage category section."
        className="settings-card"
        action={<button
            type="button"
            className="primary"
            onClick={saveFeaturedCategories}
            disabled={loadingFeaturedCategories || savingFeaturedCategories || featuredCategoryIds.length !== Math.min(4, parentCategories.length)}
          >
            <Save size={16} /> {savingFeaturedCategories ? "Saving…" : "Save selection"}
          </button>}
      >
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

      </DashboardPanel>}

      {settingsSection === "returns" && <DashboardPanel
        title={<><span className="settings-eyebrow"><RotateCcw size={13} /> CUSTOMER SERVICE</span><br />Return &amp; exchange requests</>}
        description="Control whether customers can submit requests online from their delivered orders."
        className="settings-card"
        action={<span style={{ padding: "7px 11px", borderRadius: 20, background: returnExchangeEnabled ? "#e8f3e9" : "#f5e9e5", color: returnExchangeEnabled ? "#397047" : "#934f40", fontSize: 11, fontWeight: 750 }}>
            {returnExchangeEnabled ? "ONLINE REQUESTS ON" : "EMAIL SUPPORT ONLY"}
          </span>}
      >
        {returnExchangeMessage && <p role="status" className="announcement-feedback">{returnExchangeMessage}</p>}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, padding: 18, border: "1px solid #e7e2dc", borderRadius: 12, background: "#fff", marginTop: 18 }}>
          <div><strong style={{ color: "#402514", fontSize: 14 }}>Enable online return & exchange</strong><p style={{ margin: "5px 0 0", color: "#718076", fontSize: 12 }}>{returnExchangeEnabled ? "The admin queue and customer request forms are available." : "The admin queue is hidden and customers see the support email option."}</p></div>
          <button type="button" role="switch" aria-checked={returnExchangeEnabled} aria-label="Enable return and exchange requests" disabled={loadingReturnExchange || savingReturnExchange} onClick={() => saveReturnExchange(!returnExchangeEnabled)} style={{ flex: "0 0 auto", width: 54, height: 30, border: 0, borderRadius: 20, padding: 3, background: returnExchangeEnabled ? "#496b4c" : "#aaa39a", cursor: loadingReturnExchange || savingReturnExchange ? "wait" : "pointer", opacity: loadingReturnExchange || savingReturnExchange ? .6 : 1 }}><span style={{ display: "block", width: 24, height: 24, borderRadius: "50%", background: "white", transform: returnExchangeEnabled ? "translateX(24px)" : "translateX(0)", transition: "transform .18s" }} /></button>
        </div>
        <small className="announcement-help">Changes publish immediately. Existing requests remain stored when the feature is turned off.</small>
      </DashboardPanel>}

      {/* Delete Announcement Confirmation Modal */}
      <ConfirmModal
        isOpen={announcementToDelete !== null}
        onClose={() => setAnnouncementToDelete(null)}
        onConfirm={() => {
          if (announcementToDelete !== null) {
            removeAnnouncement(announcementToDelete);
            setAnnouncementToDelete(null);
          }
        }}
        title="Delete Announcement?"
        message={`Are you sure you want to delete announcement #${(announcementToDelete ?? 0) + 1}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
