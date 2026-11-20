"use client";

import { DashboardPanel } from "@/components/admin/dashboard";
import { PageStats, SearchField } from "@/components/admin/global";
import {
  ReturnRequestsTable,
  ReturnReviewModal,
  useReturnRequests,
} from "@/components/admin/returns";
import { ReturnRequestFilterBar } from "./ReturnRequestFilterBar";

/**
 * Returns & Exchanges page: request stats, the filterable request queue and the
 * review dialog for the selected request.
 */
export default function ReturnsPage({
  rows = [],
  query = "",
  setQuery,
  token,
  onRefresh,
  notify,
}) {
  const {
    filter,
    setFilter,
    typeFilter,
    setTypeFilter,
    refundFilter,
    setRefundFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    counts,
    visible,
    selected,
    setSelected,
    saving,
    save,
  } = useReturnRequests({ rows, query, token, notify, onRefresh });

  return (
    <>
      <PageStats page="Returns & Exchanges" rows={rows} allRows={rows} />

      <DashboardPanel
        title="Return & exchange requests"
        description="Review customer requests and manage their resolution."
        className="returns-panel"
      >
        <div className="returns-toolbar">
          <ReturnRequestFilterBar
            requestType={typeFilter}
            onRequestTypeChange={setTypeFilter}
            requestStatus={filter}
            onRequestStatusChange={setFilter}
            refundStatus={refundFilter}
            onRefundStatusChange={setRefundFilter}
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            pendingCount={counts.pending}
          />
          <SearchField
            value={query}
            onChange={setQuery || (() => {})}
            placeholder="Search request, order, customer"
          />
        </div>

        <ReturnRequestsTable rows={visible} hasRequests={rows.length > 0} onReview={setSelected} />
      </DashboardPanel>

      <ReturnReviewModal
        request={selected}
        saving={saving}
        onClose={() => setSelected(null)}
        onSave={save}
      />
    </>
  );
}
