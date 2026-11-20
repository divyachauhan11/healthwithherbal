/**
 * Status pill for a return request or its linked order.
 * @param {{status: string, label?: import("react").ReactNode}} props `label` defaults to the status.
 */
export function ReturnStatusBadge({ status, label = status }) {
  return <span className={`returns-status status-${status}`}>{label}</span>;
}
