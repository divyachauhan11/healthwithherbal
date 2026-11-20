/**
 * Toggle chip for one product badge preset.
 * @param {object} props
 * @param {string} props.preset Preset name.
 * @param {boolean} props.isSelected Whether the preset is in the current badge value.
 * @param {() => void} props.onToggle Adds or removes the preset.
 */
export function BadgePresetButton({ preset, isSelected, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        border: isSelected
          ? "1.5px solid var(--forest, #153a2f)"
          : "1px solid #d1d5db",
        background: isSelected
          ? "var(--forest, #153a2f)"
          : "#f3f4f6",
        color: isSelected ? "#ffffff" : "#374151",
        borderRadius: "5px",
        padding: "4px 10px",
        fontSize: "11.5px",
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.15s ease",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {isSelected && <span>✓</span>}
      {preset === "New" ? "✨ New" : preset}
    </button>
  );
}
