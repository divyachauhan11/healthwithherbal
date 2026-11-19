"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Printer } from "lucide-react";
import { fetchOrderDetails } from "@/lib/api";
import { DataTable } from "@/components/admin/tables";

const money = (value) => `₹${(Number(value) || 0).toFixed(2)}`;
const date = (value) => value
  ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
  : "—";

export function OrderInvoicePage({ order, navigate }) {
  const [loadedOrder, setLoadedOrder] = useState(null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState("");

  useEffect(() => {
    if (order) {
      setLoadedOrder(order);
      setLoading(false);
      return;
    }
    const identifier = decodeURIComponent(window.location.pathname.split("/").filter(Boolean).at(-2) || "");
    if (!identifier) {
      setLoading(false);
      setError("Order number is missing.");
      return;
    }
    let active = true;
    fetchOrderDetails(identifier)
      .then((data) => { if (active) setLoadedOrder(data); })
      .catch((fetchError) => { if (active) setError(fetchError.message || "Could not load this order."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [order]);

  if (loading) {
    return <div className="invoice-state"><Loader2 className="spin-animate" /> Loading invoice…</div>;
  }
  if (!loadedOrder) {
    return <div className="invoice-state"><p>{error || "Order not found."}</p><button type="button" className="app-button" onClick={() => navigate("account", { tab: "orders" })}>Back to My Orders</button></div>;
  }

  const shipping = loadedOrder.shippingAddress || loadedOrder.customer || {};
  const billing = loadedOrder.billingAddress || shipping;
  const invoiceNumber = `HWH-${loadedOrder.orderNumber || String(loadedOrder._id).slice(-8).toUpperCase()}`;

  return (
    <main className="invoice-page page-width">
      <div className="invoice-toolbar no-print">
        <button type="button" className="invoice-back" onClick={() => navigate("order-details", { orderId: loadedOrder.orderNumber || loadedOrder._id })}>
          <ArrowLeft size={17} /> Back to order
        </button>
        <button type="button" className="app-button" onClick={() => window.print()}>
          <Printer size={16} /> Print / Save as PDF
        </button>
      </div>

      <article className="invoice-paper invoice-print">
        <header className="invoice-heading">
          <div className="invoice-brand">
            <img src="/health-with-herbal-logo-tight.png" alt="Health With Herbal" />
            <span>Health With Herbal</span>
          </div>
          <div className="invoice-title-block">
            <span>Customer copy</span>
            <h1>INVOICE</h1>
            <strong>{invoiceNumber}</strong>
          </div>
        </header>

        <section className="invoice-info-grid">
          <div className="invoice-info-card">
            <h2>Customer details</h2>
            <dl>
              <dt>Name</dt><dd>{[shipping.firstName, shipping.lastName].filter(Boolean).join(" ") || [billing.firstName, billing.lastName].filter(Boolean).join(" ") || loadedOrder.customer?.name || "—"}</dd>
              <dt>Email</dt><dd>{shipping.email || loadedOrder.customer?.email || "—"}</dd>
              <dt>Phone</dt><dd>{shipping.phone || loadedOrder.customer?.phone || "—"}</dd>
              <dt>Delivery address</dt><dd>{[shipping.street, shipping.city, shipping.state, shipping.postalCode, shipping.country].filter(Boolean).join(", ") || "—"}</dd>
              <dt>Billing address</dt><dd>{[billing.street, billing.city, billing.state, billing.postalCode, billing.country].filter(Boolean).join(", ") || "Same as delivery address"}</dd>
            </dl>
          </div>
          <div className="invoice-info-card">
            <h2>Order details</h2>
            <dl>
              <dt>Invoice date</dt><dd>{date(loadedOrder.updatedAt || loadedOrder.createdAt)}</dd>
              <dt>Order number</dt><dd>{loadedOrder.orderNumber || "—"}</dd>
              <dt>Order date</dt><dd>{date(loadedOrder.createdAt)}</dd>
              <dt>Order status</dt><dd>{String(loadedOrder.status || "placed").toUpperCase()}</dd>
              <dt>Payment method</dt><dd>{loadedOrder.paymentMethod === "cash_on_delivery" ? "Cash on Delivery" : loadedOrder.paymentMethod || "—"}</dd>
              {loadedOrder.trackingId && <><dt>Tracking ID</dt><dd>{loadedOrder.trackingId}</dd></>}
            </dl>
          </div>
        </section>

        <section className="invoice-items-section">
          <h2>Order summary</h2>
          <div className="invoice-table-wrap">
            <DataTable
              data={loadedOrder.items || []}
              rowKey={(item, index) => `${item.legacyId || item.product || item.title}-${index}`}
              pagination={false}
              tableClassName="invoice-table"
              columns={[
                {
                  key: "item",
                  label: "Item",
                  render: (item) => (
                    <>
                      <strong>{item.titleSnapshot || item.title || "Product"}</strong>
                      {(item.brandSnapshot || item.brand) && <small>{item.brandSnapshot || item.brand}</small>}
                    </>
                  ),
                },
                { key: "skuSnapshot", label: "SKU", render: (item) => item.skuSnapshot || item.sku || "—" },
                { key: "quantity", label: "Qty.", className: "numeric", cellClassName: "numeric" },
                { key: "unitPrice", label: "Unit price", className: "numeric", cellClassName: "numeric", render: (item) => money(item.unitPrice) },
                { key: "lineTotal", label: "Line total", className: "numeric", cellClassName: "numeric", render: (item) => money(item.lineTotal ?? Number(item.unitPrice) * Number(item.quantity)) },
              ]}
            />
          </div>

          <div className="invoice-bottom-grid">
            <div className="invoice-tax-note">
              <strong>Tax information</strong>
              <p>Product HSN codes, GST rates, and seller GST registration details are not stored with this order. This invoice therefore shows the recorded order amounts and does not calculate or represent a GST tax breakdown.</p>
            </div>
            <dl className="invoice-totals">
              <div><dt>Subtotal</dt><dd>{money(loadedOrder.subtotal)}</dd></div>
              {(Number(loadedOrder.discount) || 0) > 0 && <div><dt>Discount{loadedOrder.couponCode ? ` (${loadedOrder.couponCode})` : ""}</dt><dd>−{money(loadedOrder.discount)}</dd></div>}
              <div><dt>Shipping</dt><dd>{Number(loadedOrder.shipping) === 0 ? "Free" : money(loadedOrder.shipping)}</dd></div>
              <div className="invoice-grand-total"><dt>Total</dt><dd>{money(loadedOrder.total)}</dd></div>
            </dl>
          </div>
          {loadedOrder.orderNote && <p className="invoice-order-note"><strong>Delivery note:</strong> {loadedOrder.orderNote}</p>}
        </section>

        <footer className="invoice-footer">
          <strong>Thank you for choosing Health With Herbal.</strong>
          <span>Generated from the order information recorded in your account.</span>
        </footer>
      </article>
    </main>
  );
}
