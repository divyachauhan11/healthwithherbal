import { ArrowUpRight } from "lucide-react";

export function StatCard({
  id,
  label,
  title,
  value,
  badge,
  pulseDot,
  pulseAlert,
  icon: Icon,
  sub,
  hint,
  tone = "forest",
  onClick,
  active = false,
}) {
  const displayLabel = label || title;
  const isClickable = Boolean(onClick);

  return (
    <article
      key={id}
      className={`stat-card tone-${tone} ${isClickable ? "is-clickable" : ""} ${active ? "is-active" : ""}`.trim()}
      onClick={onClick}
      title={`${displayLabel}: ${value}`}
    >
      <div className="stat-top">
        <span className="stat-label">{displayLabel}</span>
        {badge && (
          <span className="stat-badge">
            {pulseDot && <span className="stat-pulse-dot" />}
            {pulseAlert && <span className="stat-pulse-alert" />}
            {badge}
          </span>
        )}
      </div>

      <div className="stat-middle">
        <strong className="stat-value">{value}</strong>
        {Icon && (
          <div className="mini-stat-icon">
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="stat-bottom">
        <span>{sub}</span>
        {hint && (
          <span className="stat-action-hint">
            {hint} <ArrowUpRight size={12} />
          </span>
        )}
      </div>
    </article>
  );
}
