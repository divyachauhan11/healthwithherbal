"use client";

import { DashboardPanel } from "@/components/admin/dashboard";
import { SearchField } from "@/components/admin/global";
import {
  PaymentDetailsModal,
  PaymentStatusFilters,
  PaymentSummaryCards,
  PaymentsTable,
  usePayments,
} from "@/components/admin/payments";

/**
 * Payments page: summary cards, status-filtered payments table and the payment details dialog.
 */
export default function PaymentsPage({ rows = [], query = "", setQuery, token, notify, onRefresh }) {
  const {
    statusFilter,
    setStatusFilter,
    selected,
    setSelected,
    updatingPaymentId,
    counts,
    failedCount,
    filteredRows,
    updateStatus,
  } = usePayments({ rows, token, notify, onRefresh });

  return (
    <>
      <PaymentSummaryCards counts={counts} />
      <DashboardPanel title="Payments" description="Review payment methods, transaction references, and collection status." className="payments-panel">
        <div className="payments-toolbar">
          <PaymentStatusFilters
            counts={counts}
            failedCount={failedCount}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
          <SearchField value={query} onChange={setQuery || (() => {})} placeholder="Search payment, order, customer or transaction" />
        </div>
        <PaymentsTable
          rows={filteredRows}
          hasPayments={rows.length > 0}
          updatingPaymentId={updatingPaymentId}
          onStatusChange={updateStatus}
          onView={setSelected}
        />
      </DashboardPanel>
      <PaymentDetailsModal payment={selected} onClose={() => setSelected(null)} />
    </>
  );
}
