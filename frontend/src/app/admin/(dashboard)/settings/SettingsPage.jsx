"use client";

import { useState } from "react";
import {
  AnnouncementDeleteModal,
  AnnouncementSettingsCard,
  FeaturedCategoriesCard,
  ReturnExchangeSettingsCard,
  SettingsHeaderBanner,
  SettingsSectionNav,
  useAnnouncementSettings,
  useFeaturedCategorySettings,
  useReturnExchangeSetting,
} from "@/components/admin/settings";

/**
 * Store settings page: announcement bar, return/exchange availability and the
 * homepage's featured parent categories, one section at a time.
 */
export default function SettingsPage({ token, user }) {
  const returnExchange = useReturnExchangeSetting(token);
  const announcements = useAnnouncementSettings(token);
  const featuredCategories = useFeaturedCategorySettings(token);
  const [settingsSection, setSettingsSection] = useState("announcements");

  return (
    <div className="settings-dashboard">
      <SettingsHeaderBanner email={user?.email} />

      <SettingsSectionNav activeSection={settingsSection} onSectionChange={setSettingsSection} />

      {settingsSection === "announcements" && <AnnouncementSettingsCard settings={announcements} />}

      {settingsSection === "store" && <FeaturedCategoriesCard settings={featuredCategories} />}

      {settingsSection === "returns" && <ReturnExchangeSettingsCard settings={returnExchange} />}

      <AnnouncementDeleteModal
        index={announcements.pendingDelete}
        onCancel={announcements.cancelDelete}
        onConfirm={announcements.confirmDelete}
      />
    </div>
  );
}
