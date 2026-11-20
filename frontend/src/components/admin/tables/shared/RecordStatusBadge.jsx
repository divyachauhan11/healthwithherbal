import { StatusBadge } from "@/components/shared/StatusBadge";
import { RECORD_STATUS_BADGES } from "./record-utils";

/**
 * The `.status` pill used by admin tables (Active, Hidden, Paused, ...).
 * @param {{status: string}} props Status label; also selects the pill colour.
 */
export function RecordStatusBadge({ status }) {
  return <StatusBadge className="status" status={status} statusMap={RECORD_STATUS_BADGES} />;
}
