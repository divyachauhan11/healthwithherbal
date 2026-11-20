import { BadgePresetButton } from "./BadgePresetButton";
import {
  PRODUCT_BADGE_PRESETS,
  hasBadgeTag,
  parseBadgeTags,
  toggleBadgeTag,
} from "./product-badge-utils";

/**
 * Product badge (promotion tag) editor: free-text input with a clear button,
 * preset toggle chips and a usage hint.
 * @param {object} props
 * @param {string} [props.value] Comma-separated badge value.
 * @param {(value: string) => void} props.onChange Receives the new badge value.
 */
export function ProductBadgeField({ value, onChange }) {
  const currentTags = parseBadgeTags(value);

  return (
    <label>
      <span className="field-label">Product Badge (Tag)</span>
      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. New, Bestseller (select multiple below or type comma-separated)"
          style={{ flex: 1 }}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            style={{
              border: "1px solid #d1d5db",
              background: "#f9fafb",
              borderRadius: "6px",
              padding: "8px 12px",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: 600,
              color: "#6b7280",
            }}
          >
            Clear
          </button>
        )}
      </div>
      <div
        style={{
          display: "flex",
          gap: "6px",
          marginTop: "6px",
          flexWrap: "wrap",
        }}
      >
        {PRODUCT_BADGE_PRESETS.map((preset) => (
          <BadgePresetButton
            key={preset}
            preset={preset}
            isSelected={hasBadgeTag(currentTags, preset)}
            onToggle={() => onChange(toggleBadgeTag(currentTags, preset))}
          />
        ))}
      </div>
      <small
        className="field-hint"
        style={{
          display: "block",
          marginTop: "4px",
          color: "#6b7280",
        }}
      >
        You can select multiple badges (e.g. <b>New, Bestseller</b>
        ). Selecting <b>&ldquo;New&rdquo;</b> makes the product
        eligible for the New launches section.
      </small>
    </label>
  );
}
