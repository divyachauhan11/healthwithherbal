import { Megaphone, RotateCcw, Tags } from "lucide-react";
import { SettingsSectionTab } from "./SettingsSectionTab";

/**
 * Navigation between the settings sections ("announcements", "returns", "store").
 * @param {{activeSection: string, onSectionChange: (section: string) => void}} props
 */
export function SettingsSectionNav({ activeSection, onSectionChange }) {
  return (
    <nav aria-label="Settings sections" style={{ display: "flex", gap: 10, borderBottom: "1px solid #e7e2dc", margin: "18px 0 22px", paddingBottom: 10, overflowX: "auto" }}>
      <SettingsSectionTab active={activeSection === "announcements"} onSelect={() => onSectionChange("announcements")}>
        <Megaphone size={16} /> Announcement Bar
      </SettingsSectionTab>
      <SettingsSectionTab active={activeSection === "returns"} onSelect={() => onSectionChange("returns")}>
        <RotateCcw size={16} /> Returns & Exchanges
      </SettingsSectionTab>
      <SettingsSectionTab active={activeSection === "store"} onSelect={() => onSectionChange("store")}>
        <Tags size={16} /> Featured parent categories
      </SettingsSectionTab>
    </nav>
  );
}
