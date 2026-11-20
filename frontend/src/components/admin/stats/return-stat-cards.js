import { Check, Clock3, PackageCheck, RotateCcw } from "lucide-react";
import { RETURN_EXCHANGE_STATUSES } from "@/constants/statuses";

/**
 * Stat cards of the Returns & Exchanges page: all, pending, approved and completed requests.
 * @param {{rows: Array<Object>, allRows: Array<Object>}} context
 * @returns {Array<Object>} StatCard props.
 */
export function getReturnStatCards({ rows, allRows }) {
  const requests = allRows.length ? allRows : rows;
  const pending = requests.filter((request) => request.status === RETURN_EXCHANGE_STATUSES[0]).length;
  const approved = requests.filter((request) => request.status === RETURN_EXCHANGE_STATUSES[1]).length;
  const completed = requests.filter((request) => request.status === RETURN_EXCHANGE_STATUSES[3]).length;

  return [
    {
      id: "returns_all",
      label: "All requests",
      value: requests.length,
      badge: "Return & exchange",
      sub: "Customer requests received",
      tone: "forest",
      icon: RotateCcw,
    },
    {
      id: "returns_pending",
      label: "Needs review",
      value: pending,
      badge: pending ? `${pending} pending` : "All clear",
      pulseAlert: pending > 0,
      sub: "Requests awaiting a decision",
      tone: "amber",
      icon: Clock3,
    },
    {
      id: "returns_approved",
      label: "Approved",
      value: approved,
      badge: "Ready to resolve",
      sub: "Requests approved by your team",
      tone: "gold",
      icon: Check,
    },
    {
      id: "returns_completed",
      label: "Completed",
      value: completed,
      badge: "Resolved",
      sub: "Requests fully processed",
      tone: "blue",
      icon: PackageCheck,
    },
  ];
}
