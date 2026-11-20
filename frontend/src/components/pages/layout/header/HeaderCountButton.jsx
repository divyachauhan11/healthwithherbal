"use client";

/**
 * Header icon button with a label and a count badge (shown when above zero),
 * used for the wishlist and the bag.
 * @param {object} props
 * @param {React.ReactNode} props.icon
 * @param {string} props.label
 * @param {number} props.count
 * @param {() => void} props.onClick
 */
export function HeaderCountButton({ icon, label, count, onClick }) {
  return (
    <button
      type="button"
      className="icon-action count-wrap"
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
      {count > 0 && <b>{count}</b>}
    </button>
  );
}
