export function AccountPageHeader({ title, description, children }) {
  return (
    <div className="account-section-header">
      <div>
        <h1 className="account-view-title">{title}</h1>
        {description && <p className="account-view-sub">{description}</p>}
      </div>
      {children}
    </div>
  );
}
