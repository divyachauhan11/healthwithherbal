/**
 * One entry of a row actions dropdown. Closes the menu, then runs its action.
 * @param {{className: string, icon: React.ReactNode, label: React.ReactNode, onClose: () => void, onSelect?: () => void}} props
 */
export function RowActionItem({ className, icon, label, onClose, onSelect }) {
  return (
    <button
      type="button"
      className={className}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
        onSelect?.();
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
