"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  CreditCard,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { fetchAdminCustomerDetail } from "@/lib/admin-api";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/constants/statuses";
import { useAsyncResource } from "@/hooks";

const money = (amount, currency = "INR") => {
  const value = Number(amount) || 0;
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `₹${value.toFixed(2)}`;
  }
};

const dateTime = (value) => value
  ? new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  : "—";

const addressText = (address) => {
  if (!address) return "No saved delivery address";
  return [
    address.street || address.address1 || address.line1,
    address.address2 || address.line2,
    address.city,
    address.state,
    address.postalCode || address.zip,
    address.country,
  ].filter(Boolean).join(", ") || "No saved delivery address";
};

export default function CustomerDetailsModal({ customer: listCustomer, token, onClose }) {
  const loadCustomer = useCallback(
    () => fetchAdminCustomerDetail(listCustomer.email, token),
    [listCustomer.email, token],
  );
  const { data: details, loading, error } = useAsyncResource({
    load: loadCustomer,
    deps: [listCustomer.email, token],
    enabled: true,
    initialData: null,
    clearErrorOnLoad: true,
    errorMessage: (requestError) => requestError.message || "Could not load customer details.",
  });

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const account = details?.customer || listCustomer;
  const orders = details?.orders || [];
  const addresses = details?.addresses || [];
  const totalSpent = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);

  return (
    <div className="customer-details-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="customer-details-modal" role="dialog" aria-modal="true" aria-label={`Customer details for ${account?.name || account?.email}`}>
        <header className="customer-details-header">
          <div>
            <span className="customer-details-eyebrow">Customer profile</span>
            <h2>{account?.name || "Customer details"}</h2>
            <p>Profile, order history, and payment records</p>
          </div>
          <button type="button" className="customer-details-close" onClick={onClose} aria-label="Close customer details"><X size={19} /></button>
        </header>

        {loading ? (
          <div className="customer-details-state">Loading customer details…</div>
        ) : error ? (
          <div className="customer-details-error" role="alert">{error}</div>
        ) : (
          <div className="customer-details-content">
            <section className="customer-profile-card">
              <div className="customer-profile-avatar"><UserRound size={23} /></div>
              <div className="customer-profile-main">
                <strong>{account.name || "Customer"}</strong>
                <span><Mail size={14} /> {account.email || "—"}</span>
                <span><Phone size={14} /> {account.phone || "No phone provided"}</span>
                <span><MapPin size={14} /> {addressText(account.address)}</span>
              </div>
              <div className="customer-profile-created"><CalendarDays size={14} /> Joined {account.createdAt ? dateTime(account.createdAt) : "Guest checkout"}</div>
            </section>

            {(account.hasAccount || addresses.length > 0) && (
              <section className="customer-addresses-section">
                <div className="customer-details-section-heading">
                  <div><MapPin size={17} /><h3>Saved addresses</h3></div>
                  <span>{addresses.length} {addresses.length === 1 ? "address" : "addresses"}</span>
                </div>
                {addresses.length ? (
                  <div className="customer-addresses-grid">
                    {addresses.map((address) => (
                      <article className="customer-address-card" key={address._id}>
                        <div className="customer-address-card-heading">
                          <strong>{address.tag || "Address"}</strong>
                          <div>
                            {address.isDefault && <span className="customer-address-default">Default</span>}
                            <span className="customer-address-type">{address.type || "shipping"}</span>
                          </div>
                        </div>
                        <b>{address.fullName || account.name}</b>
                        {address.phone && <span className="customer-address-phone"><Phone size={13} /> {address.phone}</span>}
                        <p>{addressText(address)}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="customer-addresses-empty">This customer has not saved an address to their account.</p>
                )}
              </section>
            )}

            <section className="customer-detail-stats">
              <article><span>Total orders</span><strong>{orders.length}</strong></article>
              <article><span>Lifetime spend</span><strong>{money(totalSpent)}</strong></article>
              <article><span>Most recent order</span><strong>{orders.length ? dateTime(orders[0].createdAt) : "No orders"}</strong></article>
            </section>

            <section className="customer-orders-section">
              <div className="customer-details-section-heading">
                <div><ShoppingBag size={17} /><h3>Orders & payments</h3></div>
                <span>{orders.length} {orders.length === 1 ? "order" : "orders"}</span>
              </div>
              {orders.length ? (
                <div className="customer-orders-list">
                  {orders.map((order) => (
                    <article className="customer-order-card" key={order._id}>
                      <div className="customer-order-heading">
                        <div><strong>{order.orderNumber || `Order ${String(order._id).slice(-7)}`}</strong><small>{dateTime(order.createdAt)}</small></div>
                        <span className={`customer-order-status ${order.status || ORDER_STATUSES[0]}`}>{order.status || ORDER_STATUSES[0]}</span>
                      </div>
                      <div className="customer-order-items">
                        {(order.items || []).map((item, index) => (
                          <div key={`${item.legacyId || item.product || item.title}-${index}`}>
                            <span>{item.title || "Product"} <small>×{item.quantity || 1}</small></span>
                            <strong>{money(item.lineTotal ?? (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1), order.currency)}</strong>
                          </div>
                        ))}
                      </div>
                      <div className="customer-order-totals">
                        <span>Subtotal <b>{money(order.subtotal, order.currency)}</b></span>
                        {(Number(order.discount) || 0) > 0 && <span>Discount {order.couponCode ? `(${order.couponCode})` : ""} <b>−{money(order.discount, order.currency)}</b></span>}
                        <span>Shipping <b>{Number(order.shipping) === 0 ? "Free" : money(order.shipping, order.currency)}</b></span>
                        <span className="customer-order-total">Order total <b>{money(order.total, order.currency)}</b></span>
                      </div>
                      <div className="customer-payment-list">
                        {(order.payments || []).length ? order.payments.map((payment) => (
                          <div className="customer-payment-row" key={payment._id}>
                            <CreditCard size={15} />
                            <div><strong>{String(payment.method || order.paymentMethod || "Payment").replaceAll("_", " ")}</strong><small>{payment.gateway ? `${payment.gateway} · ` : ""}{payment.gatewayTxnId ? `Txn ${payment.gatewayTxnId} · ` : ""}{payment.paidAt ? `Paid ${dateTime(payment.paidAt)}` : `Updated ${dateTime(payment.updatedAt || payment.createdAt)}`}</small></div>
                            <span className={`customer-payment-status ${payment.status || PAYMENT_STATUSES[0]}`}>{payment.status || PAYMENT_STATUSES[0]}</span>
                            <b>{money(payment.amount, payment.currency || order.currency)}</b>
                          </div>
                        )) : (
                          <div className="customer-payment-row"><CreditCard size={15} /><div><strong>{String(order.paymentMethod || "Payment method unavailable").replaceAll("_", " ")}</strong><small>No payment record available</small></div><span className="customer-payment-status pending">Unrecorded</span><b>{money(order.total, order.currency)}</b></div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="customer-details-state"><Package size={20} /> This customer has no orders yet.</div>
              )}
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
