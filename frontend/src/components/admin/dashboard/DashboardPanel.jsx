/**
 * Dashboard card with a title, optional description and header action.
 * @param {{title: React.ReactNode, description?: React.ReactNode, action?: React.ReactNode, className?: string, children: React.ReactNode}} props
 */
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
