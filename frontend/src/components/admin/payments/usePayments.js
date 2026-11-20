"use client";

import { useMemo, useState } from "react";
import { updateAdminPayment } from "@/lib/admin-api";
import { PAYMENT_STATUSES } from "@/constants/statuses";
import {
  buildPaymentStatusUpdate,
  countPayments,
  countPaymentsWithStatus,
} from "./payment-utils";

/**
 * Owns the payments list: status filter, the payment shown in the details dialog and
 * inline status updates.
 * @param {{rows: Array<object>, token: string, notify?: Function, onRefresh?: Function}} options
 * @returns {{
 *   statusFilter: string, setStatusFilter: Function, selected: object|null, setSelected: Function,
 *   updatingPaymentId: string|null, counts: object, failedCount: number,
 *   filteredRows: Array<object>, updateStatus: (payment: object, status: string) => Promise<void>
 * }}
 */
export function usePayments({ rows, token, notify, onRefresh }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null);
  const counts = useMemo(() => countPayments(rows), [rows]);
  const failedCount = countPaymentsWithStatus(rows, PAYMENT_STATUSES[3]);
  const filteredRows = rows.filter((payment) => statusFilter === "all" || payment.status === statusFilter);

  const updateStatus = async (payment, status) => {
    if (!payment || status === payment.status) return;
    setUpdatingPaymentId(payment._id);
    try {
      await updateAdminPayment(payment._id, buildPaymentStatusUpdate(payment, status), token);
      notify?.("Payment status updated.");
      onRefresh?.();
    } catch (error) {
      notify?.(error.message || "Could not update payment status.", "error");
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  return {
    statusFilter,
    setStatusFilter,
    selected,
    setSelected,
    updatingPaymentId,
    counts,
    failedCount,
    filteredRows,
    updateStatus,
  };
}
