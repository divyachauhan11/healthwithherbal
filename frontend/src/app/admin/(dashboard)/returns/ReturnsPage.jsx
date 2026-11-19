"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, Banknote, CalendarDays, ClipboardList, ExternalLink, Package, RotateCcw, UserRound, X } from "lucide-react";
import { adminRequest } from "@/lib/admin-api";
import {
  REFUND_STATUSES,
  RETURN_EXCHANGE_STATUSES,
  RETURN_EXCHANGE_TYPES,
} from "@/constants/statuses";
import { DashboardPanel } from "@/components/admin/dashboard";
import { PageStats, SearchField } from "@/components/admin/global";
import { DataTable } from "@/components/admin/tables";
import { currencyFixed, dateLabel } from "@/components/admin/global/admin-utils";
import { ReturnRequestFilterBar } from "./ReturnRequestFilterBar";

function ReturnReviewModal({ request, saving, onClose, onSave }) {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (!request) return;
    setForm({
      status: request.status || RETURN_EXCHANGE_STATUSES[0],
      adminNote: request.adminNote || "",
      refundStatus: request.refundStatus || REFUND_STATUSES[1],
      refundAmount: request.refundAmount ?? "",
      refundMethod: request.refundMethod || "not_applicable",
      refundReference: request.refundReference || "",
    });
  }, [request]);

  useEffect(() => {
    if (!request) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && !saving && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [request, saving, onClose]);

  if (!request || typeof document === "undefined") return null;
  const customerName = request.customer?.name || "Customer";
  const itemName = request.item?.title || "Product";
  const unitPrice = Number(request.item?.unitPrice) || 0;
  const suggestedRefund = unitPrice * (Number(request.quantity) || 1);
  const order = request.order;
  const orderCustomer = [order?.customer?.firstName, order?.customer?.lastName].filter(Boolean).join(" ") || customerName;
  const addressText = (address) => [
    address?.street || address?.line1 || address?.addressLine1,
    address?.line2 || address?.addressLine2,
    address?.city,
    address?.state,
    address?.postalCode,
    address?.country,
  ].filter(Boolean).join(", ") || "No address provided";
  const orderMoney = (value) => currencyFixed(value, order?.currency || "INR");
  const isReturnRequest = String(request.type || RETURN_EXCHANGE_TYPES[0]).toLowerCase() === RETURN_EXCHANGE_TYPES[0];
  const tracksRefund = (form.refundStatus || REFUND_STATUSES[0]) !== REFUND_STATUSES[0];
  const update = (name) => (event) => setForm((current) => ({ ...current, [name]: event.target.value }));

  return createPortal(
    <div className="return-review-overlay" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <section className="return-review-modal" role="dialog" aria-modal="true" aria-labelledby="return-review-title">
        <header className="return-review-header">
          <div>
            <span className="return-review-eyebrow">Return & exchange</span>
            <h2 id="return-review-title">Review {request.type || "customer"} request</h2>
            <p>Request #{String(request._id).slice(-7).toUpperCase()} <i /> Order #{request.orderNumber}</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close review"><X size={18} /></button>
        </header>

        <form className="return-review-form" onSubmit={(event) => { event.preventDefault(); onSave({ ...form, refundAmount: Number(form.refundAmount) || 0 }); }}>
          <div className="return-review-body">
            <section className="return-review-summary">
              <article><span><CalendarDays size={14} /> Submitted</span><strong>{dateLabel(request.createdAt)}</strong></article>
              <article><span><UserRound size={14} /> Customer</span><strong>{customerName}</strong><small>{request.customer?.email || "Email not provided"}</small></article>
              <article><span><Package size={14} /> Requested item</span><strong>{itemName}</strong><small>{request.quantity || 1} × {currencyFixed(unitPrice)}</small></article>
              <article><span><ClipboardList size={14} /> Request type</span><strong className="return-review-type">{request.type || RETURN_EXCHANGE_TYPES[0]}</strong><small>Order #{request.orderNumber}</small></article>
            </section>

            <section className="return-review-order-card">
              <div className="return-review-section-heading"><div><span>Order overview</span><h3>Complete order details</h3></div><span className={`returns-status status-${order?.status || RETURN_EXCHANGE_STATUSES[0]}`}>{order?.status || "Order unavailable"}</span></div>
              {order ? <>
                <div className="return-review-order-grid">
                  <article><span>Order number</span><strong>#{order.orderNumber || request.orderNumber}</strong></article>
                  <article><span>Placed</span><strong>{dateLabel(order.createdAt)}</strong></article>
                  <article><span>Customer</span><strong>{orderCustomer}</strong><small>{order.customer?.email || order.guestEmail || request.customer?.email || "—"}</small></article>
                  <article><span>Phone</span><strong>{order.shippingAddress?.phone || order.customer?.phone || "—"}</strong></article>
                  <article><span>Payment method</span><strong>{String(order.paymentMethod || "Cash on delivery").replaceAll("_", " ")}</strong></article>
                  <article><span>Payment status</span><strong>{order.paymentStatus || (order.paymentMethod === "cash_on_delivery" ? "Due on delivery" : "See payment records")}</strong></article>
                  <article><span>Coupon applied</span><strong>{order.couponCode || "No coupon"}</strong></article>
                  <article><span>Tracking ID</span><strong>{order.trackingId || "Not assigned"}</strong></article>
                </div>
                <div className="return-review-order-addresses">
                  <article><h4>Delivery address</h4><p>{order.shippingAddress?.fullName || orderCustomer}</p><p>{addressText(order.shippingAddress || order.customer)}</p><p>{order.shippingAddress?.phone || order.customer?.phone || ""}</p></article>
                  <article><h4>Billing address</h4><p>{addressText(order.billingAddress || order.shippingAddress || order.customer)}</p></article>
                </div>
                <div className="return-review-order-items">
                  <h4>All order items</h4>
                  <p className="return-review-order-items-help">This request is for {request.quantity || 1} × {request.item?.title || "the requested product"}. The list below shows every item in the original order.</p>
                  {(order.items || []).length ? order.items.map((item, index) => {
                    const isRequestedItem = String(item.title || "").trim().toLowerCase() === String(request.item?.title || "").trim().toLowerCase();
                    return <article key={`${item.product || item.legacyId || index}`} className={isRequestedItem ? "return-review-requested-order-item" : ""}>
                    {item.image ? <img src={item.image} alt="" /> : <span className="return-review-order-item-placeholder"><Package size={15} /></span>}
                    <div><strong>{item.title || "Product"} {isRequestedItem && <span className="return-review-requested-badge">Request item</span>}</strong><small>{item.brand || ""}{item.legacyId ? ` · SKU ${item.legacyId}` : ""}</small><small>{orderMoney(item.unitPrice)} × {item.quantity || 1}</small></div>
                    <b>{orderMoney(item.lineTotal ?? Number(item.unitPrice || 0) * Number(item.quantity || 0))}</b>
                  </article>;
                  }) : <p>No item details available.</p>}
                </div>
                <div className="return-review-order-totals">
                  <div><span>Subtotal</span><strong>{orderMoney(order.subtotal)}</strong></div>
                  {Number(order.discount) > 0 && <div><span>Discount{order.couponCode ? ` · ${order.couponCode}` : ""}</span><strong>−{orderMoney(order.discount)}</strong></div>}
                  <div><span>Shipping</span><strong>{Number(order.shipping ?? order.shippingFee) === 0 ? "Free" : orderMoney(order.shipping ?? order.shippingFee)}</strong></div>
                  <div className="return-review-order-total"><span>Order total</span><strong>{orderMoney(order.total)}</strong></div>
                </div>
                <div className="return-review-payment-records">
                  <h4>Payment records</h4>
                  {(request.payments || []).length ? request.payments.map((payment) => <article key={payment._id}>
                    <span>{String(payment.method || payment.gateway || "Payment").replaceAll("_", " ")}</span>
                    <strong>{orderMoney(payment.amount)} · {payment.status || "Status unavailable"}</strong>
                    <small>{[payment._id && `Payment ID ${payment._id}`, payment.gateway, `Currency ${payment.currency || order.currency || "INR"}`, payment.gatewayTxnId && `Transaction ${payment.gatewayTxnId}`, payment.createdAt && `Recorded ${dateLabel(payment.createdAt)}`, payment.paidAt && `Paid ${dateLabel(payment.paidAt)}`].filter(Boolean).join(" · ") || "No gateway or transaction details"}</small>
                  </article>) : <p>No separate payment records found for this order.</p>}
                </div>
                {order.orderNote && <p className="return-review-order-note"><strong>Customer order note:</strong> {order.orderNote}</p>}
              </> : <p className="return-review-order-missing">The linked order could not be found.</p>}
            </section>

            <section className="return-review-reason-card">
              <div><span>Customer reason</span><p>{request.reason || "No reason provided."}</p></div>
              {request.photos?.length > 0 && (
                <div className="return-review-attachments">
                  <span>Photos ({request.photos.length})</span>
                  <div>{request.photos.map((url, index) => (
                    <a key={`${url}-${index}`} href={url} target="_blank" rel="noreferrer" aria-label={`Open customer photo ${index + 1}`}>
                      <img src={url} alt={`Customer return attachment ${index + 1}`} /><ExternalLink size={13} />
                    </a>
                  ))}</div>
                </div>
              )}
            </section>

            <section className="return-review-resolution">
              <div className="return-review-section-heading"><div><span>Resolution</span><h3>Update request</h3></div><span className={`returns-status status-${form.status}`}>{form.status}</span></div>
              <div className="return-review-fields">
                <label>Request status
                  <select required value={form.status || RETURN_EXCHANGE_STATUSES[0]} onChange={update("status")}>
                    <option value={RETURN_EXCHANGE_STATUSES[0]}>Pending</option><option value={RETURN_EXCHANGE_STATUSES[1]}>Approved</option><option value={RETURN_EXCHANGE_STATUSES[2]}>Rejected</option><option value={RETURN_EXCHANGE_STATUSES[3]}>Completed</option>
                  </select>
                </label>
                <label className="return-review-note">Internal admin note
                  <textarea rows={3} maxLength={1000} value={form.adminNote || ""} onChange={update("adminNote")} placeholder="Add handling notes or next steps" />
                  <small>Visible to admins only</small>
                </label>
              </div>
            </section>

            <section className={`return-review-refund${isReturnRequest ? "" : " return-review-refund-disabled"}`} aria-disabled={!isReturnRequest}>
              <div className="return-review-section-heading">
                <div><span><Banknote size={14} /> Refund tracking</span><h3>Record refund details</h3></div>
                <strong className="return-review-suggested">Item value · {currencyFixed(suggestedRefund)}</strong>
              </div>
              <p className="return-review-refund-help">{isReturnRequest ? "Tracking only. Saving this information does not transfer money or issue a refund." : "Refund tracking is only available for return requests. This exchange request does not require a refund."}</p>
              <div className="return-review-fields return-review-refund-fields">
                <label>Refund status
                  <select required={isReturnRequest} disabled={!isReturnRequest} value={form.refundStatus || REFUND_STATUSES[0]} onChange={(event) => setForm((current) => ({
                    ...current,
                    refundStatus: event.target.value,
                    ...(event.target.value === REFUND_STATUSES[0] ? { refundAmount: 0, refundMethod: "not_applicable" } : {}),
                  }))}>
                    <option value={REFUND_STATUSES[0]}>No refund required</option><option value={REFUND_STATUSES[1]}>Refund pending</option><option value={REFUND_STATUSES[2]}>Refund completed</option>
                  </select>
                </label>
                <label>Refund amount
                  <div className="return-review-money-input"><span>₹</span><input type="number" min="0" step="0.01" max={suggestedRefund || undefined} required={isReturnRequest && tracksRefund} disabled={!isReturnRequest || !tracksRefund} value={form.refundAmount ?? ""} onChange={update("refundAmount")} placeholder="0.00" /></div>
                </label>
                <label>Refund method
                  <select required={isReturnRequest && tracksRefund} disabled={!isReturnRequest || !tracksRefund} value={tracksRefund ? (form.refundMethod || "not_applicable") : "not_applicable"} onChange={update("refundMethod")}>
                    <option value="not_applicable">Choose method</option><option value="original_payment">Original payment method</option><option value="bank_transfer">Bank transfer</option><option value="cash">Cash</option><option value="store_credit">Store credit</option><option value="other">Other</option>
                  </select>
                </label>
                <label>Refund reference <span className="return-review-optional">Optional</span>
                  <input type="text" maxLength={120} disabled={!isReturnRequest} value={form.refundReference || ""} onChange={update("refundReference")} placeholder="Transaction or bank reference" />
                </label>
              </div>
              {request.refundProcessedAt && <p className="return-review-processed">Refund recorded as processed on {dateLabel(request.refundProcessedAt)}.</p>}
            </section>
          </div>
          <footer className="return-review-footer">
            <button type="button" className="return-review-cancel" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="return-review-save" disabled={saving}>{saving ? "Saving…" : "Save review"}</button>
          </footer>
        </form>
      </section>
    </div>,
    document.body,
  );
}

export default function ReturnsPage({
  rows = [],
  query = "",
  setQuery,
  token,
  onRefresh,
  notify,
}) {
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [refundFilter, setRefundFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const counts = useMemo(
    () => ({
      all: rows.length,
      pending: rows.filter((row) => row.status === RETURN_EXCHANGE_STATUSES[0]).length,
      approved: rows.filter((row) => row.status === RETURN_EXCHANGE_STATUSES[1]).length,
      completed: rows.filter((row) => row.status === RETURN_EXCHANGE_STATUSES[3]).length,
    }),
    [rows],
  );

  const visible = rows.filter((row) => {
    const requestedDate = row.createdAt ? new Date(row.createdAt) : null;
    const dateKey = requestedDate && !Number.isNaN(requestedDate.getTime())
      ? `${requestedDate.getFullYear()}-${String(requestedDate.getMonth() + 1).padStart(2, "0")}-${String(requestedDate.getDate()).padStart(2, "0")}`
      : "";
    const rowRefundStatus = row.refundStatus || REFUND_STATUSES[1];
    return (filter === "all" || row.status === filter) &&
      (typeFilter === "all" || String(row.type || RETURN_EXCHANGE_TYPES[0]).toLowerCase() === typeFilter) &&
      (refundFilter === "all" || rowRefundStatus === refundFilter) &&
      (!dateFrom || (dateKey && dateKey >= dateFrom)) &&
      (!dateTo || (dateKey && dateKey <= dateTo)) &&
      (!query.trim() || JSON.stringify(row).toLowerCase().includes(query.trim().toLowerCase()));
  });

  const save = async ({ status, adminNote, refundStatus, refundAmount, refundMethod, refundReference }) => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminRequest(`/return-exchange/${selected._id}`, {
        token,
        method: "PATCH",
        body: { status, adminNote, refundStatus, refundAmount, refundMethod, refundReference },
      });
      notify("Request updated successfully.");
      setSelected(null);
      onRefresh();
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "request",
      label: "Request",
      render: (row) => (
        <>
          <strong>#{String(row._id).slice(-7).toUpperCase()}</strong>
          <small className={`returns-type-tag returns-type-${String(row.type || RETURN_EXCHANGE_TYPES[0]).toLowerCase()}`}>{String(row.type || RETURN_EXCHANGE_TYPES[0]).toLowerCase()} request</small>
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
        <span className={`returns-status status-${row.status}`}>{row.status}</span>
      ),
    },
    {
      key: "refund",
      label: "Refund",
      render: (row) => (
        <>
          <span className={`returns-status refund-status-${row.refundStatus || REFUND_STATUSES[1]}`}>
            {row.refundStatus === REFUND_STATUSES[2] ? "Refund completed" : row.refundStatus === REFUND_STATUSES[1] || !row.refundStatus ? "Refund pending" : "No refund required"}
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
          onClick={() => setSelected(row)}
        >
          Review <ArrowUpRight size={14} />
        </button>
      ),
    },
  ];

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

        <div className="returns-table-wrap">
          <DataTable
            data={visible}
            columns={columns}
            rowKey="_id"
            pageSize={10}
            tableClassName="returns-table"
            emptyState={
              <div className="returns-empty">
                <div><RotateCcw size={22} /></div>
                <strong>
                  {rows.length
                    ? "No requests match this view"
                    : "No return or exchange requests yet"}
                </strong>
                <p>
                  {rows.length
                    ? "Try another status or search term."
                    : "Customer requests will appear here when submitted."}
                </p>
              </div>
            }
          />
        </div>
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
