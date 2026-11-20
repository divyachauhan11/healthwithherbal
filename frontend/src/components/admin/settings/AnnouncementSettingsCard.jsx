import { Megaphone, Plus } from "lucide-react";
import { DashboardPanel } from "@/components/admin/dashboard";
import { AnnouncementTable } from "./AnnouncementTable";
import { SettingsCardTitle } from "./SettingsCardTitle";
import { SettingsFeedback } from "./SettingsFeedback";
import { MAX_ANNOUNCEMENTS } from "./settings-utils";

/**
 * "Announcement Bar" settings card: add button, status message and the announcements table.
 * @param {{settings: object}} props State and actions returned by `useAnnouncementSettings`.
 */
export function AnnouncementSettingsCard({ settings }) {
  const { announcements, loading, saving, message, editing, draft } = settings;

  return (
    <DashboardPanel
      title={<SettingsCardTitle eyebrow={<><Megaphone size={13} /> STOREFRONT CONTENT</>}>Announcement Bar</SettingsCardTitle>}
      description="Manage the messages shown in the scrolling bar above your storefront navigation."
      className="settings-card announcement-settings-card"
      action={<button
          type="button"
          className="primary announcement-add-button"
          disabled={loading || saving || announcements.length >= MAX_ANNOUNCEMENTS}
          onClick={settings.startAdding}
        >
          <Plus size={16} /> Add announcement
        </button>}
    >
      <SettingsFeedback message={message} />
      {loading ? <p>Loading announcements…</p> : (
        <div className="announcement-table-wrap">
          <AnnouncementTable
            announcements={announcements}
            editing={editing}
            draft={draft}
            saving={saving}
            onDraftChange={settings.setDraft}
            onSave={settings.saveDraft}
            onCancel={settings.cancelEditing}
            onEdit={settings.startEditing}
            onDelete={settings.requestDelete}
          />
        </div>
      )}
      <small className="announcement-help">Up to 12 messages, 180 characters each. Changes publish immediately after saving. Removing all announcements hides the bar.</small>
    </DashboardPanel>
  );
}
