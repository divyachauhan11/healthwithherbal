import { Save, Tags } from "lucide-react";
import { DashboardPanel } from "@/components/admin/dashboard";
import { FeaturedCategoryOption } from "./FeaturedCategoryOption";
import { SettingsCardTitle } from "./SettingsCardTitle";
import { SettingsFeedback } from "./SettingsFeedback";
import { FEATURED_CATEGORY_LIMIT } from "./settings-utils";

/**
 * "Featured parent categories" settings card: choose and save the homepage categories.
 * @param {{settings: object}} props State and actions returned by `useFeaturedCategorySettings`.
 */
export function FeaturedCategoriesCard({ settings }) {
  const { parentCategories, selectedIds, loading, saving, message } = settings;

  return (
    <DashboardPanel
      title={<SettingsCardTitle eyebrow={<><Tags size={13} /> HOMEPAGE DISPLAY</>}>Featured parent categories</SettingsCardTitle>}
      description="Choose the four active parent categories to show in the homepage category section."
      className="settings-card"
      action={<button
          type="button"
          className="primary"
          onClick={settings.save}
          disabled={loading || saving || selectedIds.length !== Math.min(FEATURED_CATEGORY_LIMIT, parentCategories.length)}
        >
          <Save size={16} /> {saving ? "Saving…" : "Save selection"}
        </button>}
    >
      <SettingsFeedback message={message} />
      {loading ? <p>Loading parent categories…</p> : parentCategories.length === 0 ? (
        <p className="announcement-empty">Create active parent categories first to feature them on the homepage.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, margin: "14px 0 24px" }}>
          {parentCategories.map((category) => {
            const id = String(category._id);
            return (
              <FeaturedCategoryOption
                key={id}
                category={category}
                checked={selectedIds.includes(id)}
                limitReached={selectedIds.length >= FEATURED_CATEGORY_LIMIT}
                onToggle={() => settings.toggle(id)}
              />
            );
          })}
        </div>
      )}

    </DashboardPanel>
  );
}
