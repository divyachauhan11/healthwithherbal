"use client";

/**
 * Top-level main-navigation button (Home, Blog), highlighted when active.
 * @param {object} props
 * @param {string} props.label
 * @param {boolean} props.active
 * @param {() => void} props.onMouseEnter
 * @param {() => void} props.onClick
 */
export function MainNavLink({ label, active, onMouseEnter, onClick }) {
  return (
    <button
      type="button"
      className={active ? "active" : ""}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
