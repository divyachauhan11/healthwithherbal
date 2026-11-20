import { MoreVertical } from "lucide-react";

/**
 * The three-dots button that opens and closes a row actions menu.
 * @param {{isOpen: boolean, onToggle: (event: Event) => void}} props
 */
export function RowActionsTrigger({ isOpen, onToggle }) {
  return (
    <button
      type="button"
      className="action-dots-btn"
      aria-label="Actions"
      aria-expanded={isOpen}
      onClick={onToggle}
    >
      <MoreVertical size={16} />
    </button>
  );
}
