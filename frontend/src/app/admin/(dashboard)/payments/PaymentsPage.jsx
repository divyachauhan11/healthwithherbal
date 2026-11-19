"use client";

import { useMemo, useState } from "react";
import { CreditCard, Eye, X } from "lucide-react";
import { createPortal } from "react-dom";
import { DashboardPanel } from "@/components/admin/dashboard";
import { SearchField } from "@/components/admin/global";
import { DataTable } from "@/components/admin/tables";
import { currency, dateLabel, dateTimeLabel } from "@/components/admin/global/admin-utils";
import { RowActionsMenu } from "@/components/admin/tables";
import { adminRequest } from "@/lib/admin-api";
import { PAYMENT_STATUSES } from "@/constants/statuses";
import { STATUS_BADGE_MAPS } from "@/constants/status-badges";
import { StatusBadge } from "@/components/shared/StatusBadge";

const displayName = (customer) => [customer?.firstName, customer?.lastName].filter(Boolean).join(" ") || customer?.name || "Customer";
const dateTime = dateTimeLabel;

function PaymentDetails({ payment, onClose }) {
  if (!payment || typeof document === "undefined") return null;
  const order = payment.order || {};
  const customer = order.customer || payment.customer || {};
  const shipping = order.shippingAddress || customer;
  const customerName = displayName(customer);
  const addressText = (address) => [
    address?.street || address?.line1 || address?.addressLine1,
    address?.line2 || address?.addressLine2,
    address?.city,
    address?.state,
    address?.postalCode,
    address?.country,
  ].filter(Boolean).join(", ") || "Address not available";
  return createPortal(
    <div className="payment-detail-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="payment-detail-modal" role="dialog" aria-modal="true" aria-labelledby="payment-detail-title">
        <header>
          <div><span>Payment details</span><h2 id="payment-detail-title">Order #{payment.orderNumber || "—"}</h2><p>{customerName} · Recorded {dateTime(payment.createdAt)}</p></div>
          <button type="button" onClick={onClose} aria-label="Close payment details"><X size={19} /></button>
        </header>
        <div className="payment-detail-body">
          <div className="payment-detail-hero">
            <div><span>Payment amount</span><strong>{currency(payment.amount, payment.currency || "INR")}</strong></div>
            <StatusBadge
              status={payment.status || PAYMENT_STATUSES[0]}
              statusMap={STATUS_BADGE_MAPS.payment}
              className="payment-status-chip"
            />
          </div>
          <div className="payment-detail-section-grid">
            <section className="payment-detail-section">
              <div className="payment-detail-section-title"><span className="payment-detail-section-icon">01</span><div><h3>Customer</h3><p>Contact and delivery information</p></div></div>
              <div className="payment-detail-facts">
                <article><span>Name</span><strong>{customerName}</strong></article>
                <article><span>Email</span><strong>{customer.email || payment.customer?.email || "—"}</strong></article>
                <article><span>Phone</span><strong>{shipping?.phone || customer.phone || "—"}</strong></article>
                <article className="wide"><span>Delivery address</span><strong>{shipping.fullName || customerName}</strong><small>{addressText(shipping)}</small></article>
                {order.billingAddress && <article className="wide"><span>Billing address</span><strong>{order.billingAddress.fullName || customerName}</strong><small>{addressText(order.billingAddress)}</small></article>}
              </div>
            </section>

            <section className="payment-detail-section">
              <div className="payment-detail-section-title"><span className="payment-detail-section-icon">02</span><div><h3>Order</h3><p>Items, discount, and fulfillment</p></div></div>
              <div className="payment-detail-facts">
                <article><span>Order number</span><strong>#{order.orderNumber || payment.orderNumber || "—"}</strong></article>
                <article><span>Order status</span><strong className="capitalize">{order.status || payment.orderStatus || "—"}</strong></article>
                <article><span>Placed</span><strong>{dateTime(order.createdAt)}</strong></article>
                <article><span>Tracking</span><strong>{order.trackingId || "Not assigned"}</strong></article>
              </div>
              <div className="payment-detail-items">
                <div className="payment-detail-subheading"><h4>Items</h4><span>{(order.items || []).length}</span></div>
                {(order.items || []).length ? order.items.map((item, index) => <article key={`${item.product || item.legacyId || index}`}>
                  {item.image ? <img src={item.image} alt="" /> : <span className="payment-detail-item-placeholder">{String(index + 1).padStart(2, "0")}</span>}
                  <div><strong>{item.title || "Product"}</strong><small>{item.brand || ""}{item.legacyId ? ` · SKU ${item.legacyId}` : ""}</small><small>{currency(item.unitPrice, order.currency || "INR")} × {item.quantity || 1}</small></div>
                  <b>{currency(item.lineTotal ?? Number(item.unitPrice || 0) * Number(item.quantity || 0), order.currency || "INR")}</b>
                </article>) : <p className="payment-detail-empty">Order item details are unavailable.</p>}
              </div>
              <div className="payment-detail-totals">
                <div><span>Subtotal</span><strong>{currency(order.subtotal, order.currency || payment.currency || "INR")}</strong></div>
                {order.couponCode && <div><span>Coupon applied</span><strong>{order.couponCode}</strong></div>}
                {Number(order.discount) > 0 && <div><span>Discount</span><strong>−{currency(order.discount, order.currency || payment.currency || "INR")}</strong></div>}
                <div><span>Shipping</span><strong>{Number(order.shipping ?? order.shippingFee) === 0 ? "Free" : currency(order.shipping ?? order.shippingFee, order.currency || payment.currency || "INR")}</strong></div>
                <div className="grand"><span>Order total</span><strong>{currency(order.total ?? payment.orderTotal, order.currency || payment.currency || "INR")}</strong></div>
              </div>
              {order.orderNote && <p className="payment-detail-note"><strong>Order note:</strong> {order.orderNote}</p>}
            </section>
          </div>

          <section className="payment-detail-section payment-detail-record-section">
            <div className="payment-detail-section-title"><span className="payment-detail-section-icon">03</span><div><h3>Payment record</h3><p>Method, gateway reference, and audit timeline</p></div></div>
            <div className="payment-detail-facts payment-detail-payment-facts">
              <article><span>Payment ID</span><strong>{payment._id || "—"}</strong></article>
              <article><span>Payment method</span><strong className="capitalize">{String(payment.method || order.paymentMethod || "—").replaceAll("_", " ")}</strong></article>
              <article><span>Gateway</span><strong>{payment.gateway || "Cash on delivery"}</strong></article>
              <article><span>Transaction reference</span><strong>{payment.gatewayTxnId || "Not assigned"}</strong></article>
              <article><span>Recorded amount</span><strong>{currency(payment.amount, payment.currency || "INR")}</strong></article>
              <article><span>Currency</span><strong>{payment.currency || "INR"}</strong></article>
              <article><span>Created</span><strong>{dateTime(payment.createdAt)}</strong></article>
              <article><span>Last updated</span><strong>{dateTime(payment.updatedAt)}</strong></article>
              <article><span>Paid at</span><strong>{dateTime(payment.paidAt)}</strong></article>
            </div>
          </section>
        </div>
      </section>
    </div>,
    document.body,
  );
}

export default function PaymentsPage({ rows = [], query = "", setQuery, token, notify, onRefresh }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null);
  const counts = useMemo(() => ({
    all: rows.length,
    pending: rows.filter((payment) => payment.status === PAYMENT_STATUSES[0]).length,
    paid: rows.filter((payment) => payment.status === PAYMENT_STATUSES[2]).length,
    refunded: rows.filter((payment) => payment.status === PAYMENT_STATUSES[4]).length,
  }), [rows]);
  const filteredRows = rows.filter((payment) => statusFilter === "all" || payment.status === statusFilter);
  const updateStatus = async (payment, status) => {
    if (!payment || status === payment.status) return;
    setUpdatingPaymentId(payment._id);
    try {
      await adminRequest(`/payments/${payment._id}`, {
        token,
        method: "PATCH",
        body: {
          method: payment.method || "unknown",
          gateway: payment.gateway || "",
          gatewayTxnId: payment.gatewayTxnId || "",
          amount: Number(payment.amount) || 0,
          currency: payment.currency || "INR",
          status,
          paidAt: status === PAYMENT_STATUSES[2] ? payment.paidAt || new Date().toISOString() : payment.paidAt || null,
        },
      });
      notify?.("Payment status updated.");
      onRefresh?.();
    } catch (error) {
      notify?.(error.message || "Could not update payment status.", "error");
    } finally {
      setUpdatingPaymentId(null);
    }
  };
  const columns = [
    { key: "payment", label: "Payment", render: (payment) => <><strong>{String(payment._id || "").slice(-8).toUpperCase() || "—"}</strong><small>{payment.gatewayTxnId || "No transaction reference"}</small></> },
    { key: "orderNumber", label: "Order", sortable: true, render: (payment) => <><strong>#{payment.orderNumber || "—"}</strong><small>{payment.orderStatus || "Status unavailable"}</small></> },
    { key: "customer", label: "Customer", render: (payment) => <><strong>{displayName(payment.customer)}</strong><small>{payment.customer?.email || "—"}</small></> },
    { key: "method", label: "Method", render: (payment) => <><strong>{String(payment.method || "—").replaceAll("_", " ")}</strong><small>{payment.gateway || "—"}</small></> },
    { key: "status", label: "Status", render: (payment) => <select className={`payment-status-select ${payment.status || PAYMENT_STATUSES[0]}`} value={payment.status || PAYMENT_STATUSES[0]} disabled={updatingPaymentId === payment._id} onChange={(event) => updateStatus(payment, event.target.value)} aria-label={`Update payment status for order ${payment.orderNumber}`}><option value={PAYMENT_STATUSES[0]}>Pending</option><option value={PAYMENT_STATUSES[1]}>Authorized</option><option value={PAYMENT_STATUSES[2]}>Paid</option><option value={PAYMENT_STATUSES[3]}>Failed</option><option value={PAYMENT_STATUSES[4]}>Refunded</option></select> },
    { key: "amount", label: "Amount", sortable: true, render: (payment) => <strong>{currency(payment.amount, payment.currency || "INR")}</strong> },
    { key: "createdAt", label: "Date", sortable: true, render: (payment) => dateLabel(payment.createdAt) },
    { key: "actions", label: "Actions", render: (payment) => <RowActionsMenu extraActions={[{ label: "View", icon: Eye, onClick: () => setSelected(payment) }]} /> },
  ];

  return (
    <>
      <section className="payment-summary-cards" aria-label="Payment summary">
        <article><span><CreditCard size={16} /> Payment records</span><strong>{counts.all}</strong><small>All recorded transactions</small></article>
        <article><span>Paid</span><strong>{counts.paid}</strong><small>Successfully collected</small></article>
        <article><span>Awaiting collection</span><strong>{counts.pending}</strong><small>Pending or cash on delivery</small></article>
        <article><span>Refunded</span><strong>{counts.refunded}</strong><small>Marked as refunded</small></article>
      </section>
      <DashboardPanel title="Payments" description="Review payment methods, transaction references, and collection status." className="payments-panel">
        <div className="payments-toolbar">
          <div className="payments-filters" role="group" aria-label="Filter payments by status">
            {[["all", "All", counts.all], [PAYMENT_STATUSES[2], "Paid", counts.paid], [PAYMENT_STATUSES[0], "Pending", counts.pending], [PAYMENT_STATUSES[3], "Failed", rows.filter((payment) => payment.status === PAYMENT_STATUSES[3]).length], [PAYMENT_STATUSES[4], "Refunded", counts.refunded]].map(([value, label, count]) => (
              <button type="button" key={value} className={statusFilter === value ? "active" : ""} onClick={() => setStatusFilter(value)}>{label}<span>{count}</span></button>
            ))}
          </div>
          <SearchField value={query} onChange={setQuery || (() => {})} placeholder="Search payment, order, customer or transaction" />
        </div>
        <div className="payments-table-wrap">
          <DataTable
            data={filteredRows}
            columns={columns}
            rowKey="_id"
            pageSize={10}
            tableClassName="payments-table"
            emptyMessage={rows.length ? "No payments match this filter." : "Payment records will appear here when orders are placed."}
          />
        </div>
      </DashboardPanel>
      <PaymentDetails payment={selected} onClose={() => setSelected(null)} />
    </>
  );
}
