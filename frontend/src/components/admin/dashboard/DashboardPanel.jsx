export function DashboardPanel({ title, description, action, className = "", children }) {
  return (
    <article className={`panel ${className}`.trim()}>
      <div className="panel-head">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </article>
  );
}
