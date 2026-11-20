"use client";

import { ReturnDateFilter, ReturnFilterDropdown } from "@/components/admin/returns";
import {
  REFUND_STATUS_FILTER_OPTIONS,
  REQUEST_STATUS_FILTER_OPTIONS,
  REQUEST_TYPE_FILTER_OPTIONS,
  withPendingCount,
} from "@/components/admin/returns/returns-utils";

/**
 * Filters of the returns queue: request type, request status (with the pending count),
 * refund status and the requested-date range.
 */
export function ReturnRequestFilterBar({
  requestType,
  onRequestTypeChange,
  requestStatus,
  onRequestStatusChange,
  refundStatus,
  onRefundStatusChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  pendingCount = 0,
}) {
  return (
    <div className="return-request-filter-bar" aria-label="Filter return and exchange requests">
      <ReturnFilterDropdown
        label="Request type"
        value={requestType}
        onChange={onRequestTypeChange}
        options={REQUEST_TYPE_FILTER_OPTIONS}
      />
      <ReturnFilterDropdown
        label="Request status"
        value={requestStatus}
        onChange={onRequestStatusChange}
        options={withPendingCount(REQUEST_STATUS_FILTER_OPTIONS, pendingCount)}
      />
      <ReturnFilterDropdown
        label="Refund status"
        value={refundStatus}
        onChange={onRefundStatusChange}
        options={REFUND_STATUS_FILTER_OPTIONS}
      />
      <ReturnDateFilter label="Requested from" value={dateFrom} onChange={onDateFromChange} />
      <ReturnDateFilter label="Requested to" value={dateTo} onChange={onDateToChange} />
    </div>
  );
}
