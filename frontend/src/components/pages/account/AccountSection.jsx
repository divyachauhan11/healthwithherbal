/**
 * Overview section with a title and an optional "view all" style action.
 * @param {object} props
 * @param {string} props.title Section title.
 * @param {string} [props.actionLabel] Action label (hidden when empty).
 * @param {() => void} [props.onAction] Action handler.
 * @param {string} [props.className] Extra section class.
 * @param {object} [props.style] Inline section style.
 * @param {import("react").ReactNode} props.children Section content.
 */
export function AccountSection({ title, actionLabel, onAction, className = "", style, children }) {
  return (
    <section className={`account-overview-section ${className}`.trim()} style={style}>
      <div className="account-section-header">
        <h2 className="account-section-title">{title}</h2>
        {actionLabel && onAction && (
          <button type="button" className="account-view-all-link" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
      {children}
    </section>
  );
}
