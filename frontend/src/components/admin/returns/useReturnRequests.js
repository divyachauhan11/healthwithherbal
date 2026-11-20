"use client";

import { useMemo, useState } from "react";
import { updateAdminReturnRequest } from "@/lib/admin-api";
import { countReturnRequests, filterReturnRequests } from "./returns-utils";

/**
 * Owns the returns queue: filter values, the request under review and saving a review.
 * @param {{rows: Array<object>, query: string, token: string, notify: Function, onRefresh: Function}} options
 * @returns {{
 *   filter: string, setFilter: Function, typeFilter: string, setTypeFilter: Function,
 *   refundFilter: string, setRefundFilter: Function, dateFrom: string, setDateFrom: Function,
 *   dateTo: string, setDateTo: Function, counts: object, visible: Array<object>,
 *   selected: object|null, setSelected: Function, saving: boolean, save: Function
 * }}
 */
export function useReturnRequests({ rows, query, token, notify, onRefresh }) {
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [refundFilter, setRefundFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const counts = useMemo(() => countReturnRequests(rows), [rows]);

  const visible = filterReturnRequests(rows, {
    status: filter,
    type: typeFilter,
    refund: refundFilter,
    dateFrom,
    dateTo,
    query,
  });

  const save = async ({ status, adminNote, refundStatus, refundAmount, refundMethod, refundReference }) => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateAdminReturnRequest(
        selected._id,
        { status, adminNote, refundStatus, refundAmount, refundMethod, refundReference },
        token,
      );
      notify("Request updated successfully.");
      setSelected(null);
      onRefresh();
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return {
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
  };
}
