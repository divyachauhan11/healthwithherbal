/**
 * Tab button of the settings section navigation.
 * @param {{active: boolean, onSelect: () => void, children: import("react").ReactNode}} props
 */
export function SettingsSectionTab({ active, onSelect, children }) {
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={onSelect}
      style={{ display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", border: 0, borderRadius: 8, padding: "10px 14px", cursor: "pointer", fontWeight: 700, background: active ? "var(--forest, #153a2f)" : "transparent", color: active ? "#fff" : "#52645d" }}
    >
      {children}
    </button>
  );
}
