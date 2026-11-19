/**
 * Render a status badge using the existing element and domain-specific class
 * and label map.
 * @param {{status: string, label?: string, statusMap?: Object, className?: string}} props
 */
export function StatusBadge({ status, label, statusMap = {}, className = "" }) {
  const mapped = statusMap[status] || {};
  const statusClass = mapped.className ?? status;
  const displayLabel = label ?? mapped.label ?? status;

  return (
    <span className={className ? `${className} ${statusClass}` : statusClass}>
      {displayLabel}
    </span>
  );
}

export default StatusBadge;
