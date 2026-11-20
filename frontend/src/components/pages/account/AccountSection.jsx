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
