export function AdminPageHeader({
  title,
  description,
  loading = false,
  onAddUser,
}) {
  return (
    <div className="title-row">
      <div>
        <span className="eyebrow">STORE OVERVIEW</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {title === "Users" && onAddUser ? (
        <button type="button" className="primary" onClick={onAddUser}>
          <span aria-hidden="true">+</span> Add New User
        </button>
      ) : (
        <div className="admin-updated">
          {loading ? "Syncing…" : "Live data"}
          <span className="live-dot" />
        </div>
      )}
    </div>
  );
}
