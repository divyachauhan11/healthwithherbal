/**
 * Sidebar navigation button with an optional count badge.
 * @param {object} props
 * @param {string} props.label Page name.
 * @param {import("react").ComponentType<{size?: number}>} props.icon
 * @param {boolean} props.active Whether this page is shown.
 * @param {number} [props.badge] Count shown when greater than 0.
 * @param {() => void} props.onSelect
 */
export function AdminSidebarNavItem({ label, icon: Icon, active, badge, onSelect }) {
  return (
    <button
      className={active ? "active" : ""}
      onClick={onSelect}
    >
      <Icon size={18} />
      <span>{label}</span>
      {badge > 0 && (
        <em>{badge}</em>
      )}
    </button>
  );
}
