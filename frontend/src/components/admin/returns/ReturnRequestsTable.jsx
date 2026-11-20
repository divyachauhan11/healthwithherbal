import { ArrowUpRight } from "lucide-react";
import { REFUND_STATUSES } from "@/constants/statuses";
import { DataTable } from "@/components/admin/tables";
import { currencyFixed, dateLabel } from "@/components/admin/global/admin-utils";
import { ReturnRequestsEmptyState } from "./ReturnRequestsEmptyState";
import { ReturnStatusBadge } from "./ReturnStatusBadge";
import { formatRequestReference, getRefundStatusLabel, getRequestType } from "./returns-utils";

/**
 * Paginated table of return/exchange requests with a "Review" action per row.
 * @param {{rows: Array<object>, hasRequests: boolean, onReview: (request: object) => void}} props
 *   `rows` are the filtered requests; `hasRequests` selects the empty-state copy.
 */
export function ReturnRequestsTable({ rows, hasRequests, onReview }) {
  const columns = [
    {
      key: "request",
      label: "Request",
      render: (row) => (
        <>
          <strong>#{formatRequestReference(row._id)}</strong>
          <small className={`returns-type-tag returns-type-${getRequestType(row)}`}>{getRequestType(row)} request</small>
          <small>Order #{row.orderNumber}</small>
        </>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (row) => (
        <>
          <strong>{row.customer?.name || "Customer"}</strong>
          <small>{row.customer?.email}</small>
        </>
      ),
    },
    {
      key: "item",
      label: "Item",
      render: (row) => (
        <>
          <strong>{row.item?.title}</strong>
          <small>
            {row.quantity} × {currencyFixed(row.item?.unitPrice)}
          </small>
        </>
      ),
    },
    { key: "createdAt", label: "Requested", sortable: true, render: (row) => dateLabel(row.createdAt) },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <ReturnStatusBadge status={row.status} />
      ),
    },
    {
      key: "refund",
      label: "Refund",
      render: (row) => (
        <>
          <span className={`returns-status refund-status-${row.refundStatus || REFUND_STATUSES[1]}`}>
            {getRefundStatusLabel(row.refundStatus)}
          </span>
          {Number(row.refundAmount) > 0 && <small>{currencyFixed(row.refundAmount)}</small>}
        </>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <button
          type="button"
          className="returns-view"
          onClick={() => onReview(row)}
        >
          Review <ArrowUpRight size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="returns-table-wrap">
      <DataTable
        data={rows}
        columns={columns}
        rowKey="_id"
        pageSize={10}
        tableClassName="returns-table"
        emptyState={<ReturnRequestsEmptyState hasRequests={hasRequests} />}
      />
    </div>
  );
}
