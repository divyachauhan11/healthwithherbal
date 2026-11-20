import { PAYMENT_STATUSES } from "@/constants/statuses";

/**
 * Status filter buttons with per-status counts.
 * @param {{counts: object, failedCount: number, statusFilter: string, onStatusFilterChange: (status: string) => void}} props
 */
export function PaymentStatusFilters({ counts, failedCount, statusFilter, onStatusFilterChange }) {
  return (
    <div className="payments-filters" role="group" aria-label="Filter payments by status">
      {[["all", "All", counts.all], [PAYMENT_STATUSES[2], "Paid", counts.paid], [PAYMENT_STATUSES[0], "Pending", counts.pending], [PAYMENT_STATUSES[3], "Failed", failedCount], [PAYMENT_STATUSES[4], "Refunded", counts.refunded]].map(([value, label, count]) => (
        <button type="button" key={value} className={statusFilter === value ? "active" : ""} onClick={() => onStatusFilterChange(value)}>{label}<span>{count}</span></button>
      ))}
    </div>
  );
}
