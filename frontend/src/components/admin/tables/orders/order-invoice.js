import { dateLabelLong } from "../../global/admin-utils";
import { formatPaymentMethod, getOrderItemTotal } from "./order-utils";

const INVOICE_STYLES = "\n    *{box-sizing:border-box}body{margin:0;padding:36px;background:#f4f1eb;color:#30251d;font:14px Arial,sans-serif}.invoice{max-width:900px;margin:auto;padding:42px;background:#fff;border:1px solid #e8dfd2;border-radius:12px}.head{display:flex;justify-content:space-between;gap:20px;padding-bottom:24px;border-bottom:2px solid #4a2413}.brand{font-size:23px;font-weight:700;color:#4a2413}.brand small{display:block;margin-top:7px;color:#85796d;font-size:11px;font-weight:400}.title{text-align:right}.title span{color:#92714e;font-size:11px;text-transform:uppercase;letter-spacing:.1em}.title h1{margin:5px 0;color:#4a2413;font:700 30px Georgia,serif}.title b{font-size:12px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:24px 0}.card{padding:16px;border:1px solid #ebe4da;border-radius:8px}.card h2{margin:0 0 12px;font-size:14px;color:#4a2413}.card p{margin:5px 0;color:#51463c;line-height:1.5;overflow-wrap:anywhere}.card strong{color:#30251d}table{width:100%;border-collapse:collapse;margin-top:14px;text-align:left}th{padding:11px 8px;background:#f7f3ec;color:#776757;font-size:10px;text-transform:uppercase;letter-spacing:.06em}td{padding:12px 8px;border-bottom:1px solid #eee8df;font-size:12px}td small{display:block;margin-top:4px;color:#82766a}.numeric{text-align:right;white-space:nowrap}.totals{width:min(360px,100%);margin:22px 0 0 auto}.totals div{display:flex;justify-content:space-between;padding:7px 0;color:#6f6257}.totals .grand{margin-top:6px;padding-top:12px;border-top:1px solid #ddd2c3;color:#30251d;font-weight:700;font-size:16px}.note{margin-top:22px;padding:14px;background:#faf7f1;border-radius:8px;color:#66594f}.foot{margin-top:30px;padding-top:16px;border-top:1px solid #eee8df;text-align:center;color:#887a6b;font-size:11px}.toolbar{max-width:900px;margin:0 auto 14px;text-align:right}.toolbar button{border:0;border-radius:7px;padding:10px 16px;background:#4a2413;color:#fff;font-weight:700;cursor:pointer}@media print{body{padding:0;background:#fff}.invoice{max-width:none;border:0;border-radius:0;padding:12mm;box-shadow:none}.toolbar{display:none}}\n    ";

/**
 * Escape a value for safe use inside the invoice HTML.
 * @param {*} value
 * @returns {string}
 */
export const escapeInvoiceHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

/** One-line invoice address ("—" when empty). */
const formatInvoiceAddress = (value) => [value?.street || value?.line1, value?.line2, value?.city, value?.state, value?.postalCode, value?.country].filter(Boolean).join(", ") || "—";

/** Table rows for the order's items. */
const renderInvoiceItemRows = (order, amount) => (order.items || []).map((item) => `<tr><td><strong>${escapeInvoiceHtml(item.title || item.titleSnapshot || item.name || "Product")}</strong><small>${escapeInvoiceHtml(item.brand || item.brandSnapshot || "")}</small></td><td>${escapeInvoiceHtml(item.sku || item.skuSnapshot || item.legacyId || "—")}</td><td class="numeric">${Number(item.quantity) || 1}</td><td class="numeric">${amount(item.unitPrice)}</td><td class="numeric">${amount(getOrderItemTotal(item))}</td></tr>`).join("");

/** Subtotal, discount, shipping and grand total block. */
const renderInvoiceTotals = (order, amount) => `<section class="totals"><div><span>Subtotal</span><strong>${amount(order.subtotal)}</strong></div>${Number(order.discount) > 0 ? `<div><span>Discount${order.couponCode ? ` (${escapeInvoiceHtml(order.couponCode)})` : ""}</span><strong>−${amount(order.discount)}</strong></div>` : ""}<div><span>Shipping</span><strong>${Number(order.shipping ?? order.shippingFee) === 0 ? "Free" : amount(order.shipping ?? order.shippingFee)}</strong></div><div class="grand"><span>Total</span><strong>${amount(order.total)}</strong></div></section>`;

/**
 * Build a standalone, printable HTML invoice for an order.
 * @param {Object} order Admin order record.
 * @returns {string} Complete HTML document.
 */
export function buildOrderInvoiceHtml(order) {
  const amount = (value) => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: order.currency || "INR",
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);
  const customer = order.customer || {};
  const shipping = order.shippingAddress || customer;
  const billing = order.billingAddress || shipping;
  const customerName = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.name || "—";
  const orderDate = dateLabelLong(order.createdAt);
  const itemRows = renderInvoiceItemRows(order, amount);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Invoice ${escapeInvoiceHtml(order.orderNumber)}</title><style>${INVOICE_STYLES}</style></head><body><div class="toolbar"><button onclick="window.print()">Print invoice</button></div><main class="invoice"><header class="head"><div class="brand">Health With Herbal<small>Order invoice</small></div><div class="title"><span>Invoice</span><h1>INVOICE</h1><b>${escapeInvoiceHtml(order.orderNumber || "—")}</b></div></header><section class="grid"><article class="card"><h2>Customer & delivery</h2><p><strong>${escapeInvoiceHtml(customerName)}</strong></p><p>${escapeInvoiceHtml(customer.email || order.guestEmail || "—")}</p><p>${escapeInvoiceHtml(customer.phone || shipping.phone || "—")}</p><p>${escapeInvoiceHtml(formatInvoiceAddress(shipping))}</p></article><article class="card"><h2>Order information</h2><p>Order date: <strong>${escapeInvoiceHtml(orderDate)}</strong></p><p>Status: <strong>${escapeInvoiceHtml(order.status || "—")}</strong></p><p>Payment: <strong>${escapeInvoiceHtml(formatPaymentMethod(order))}</strong></p><p>Billing: ${escapeInvoiceHtml(formatInvoiceAddress(billing))}</p>${order.trackingId ? `<p>Tracking ID: ${escapeInvoiceHtml(order.trackingId)}</p>` : ""}</article></section><h2>Order items</h2><table><thead><tr><th>Item</th><th>SKU</th><th class="numeric">Qty</th><th class="numeric">Unit price</th><th class="numeric">Line total</th></tr></thead><tbody>${itemRows || `<tr><td colspan="5">No items listed.</td></tr>`}</tbody></table>${renderInvoiceTotals(order, amount)}${order.orderNote ? `<div class="note"><strong>Delivery note:</strong> ${escapeInvoiceHtml(order.orderNote)}</div>` : ""}<footer class="foot">Thank you for choosing Health With Herbal.</footer></main></body></html>`;
}

/**
 * Download the order invoice as an HTML file.
 * @param {Object} order
 */
export function downloadOrderInvoice(order) {
  const file = new Blob([buildOrderInvoiceHtml(order)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = `invoice-${String(order.orderNumber || order._id || "order").replace(/[^a-z0-9-_]/gi, "-")}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Open the order invoice in a new window and print it.
 * @param {Object} order
 */
export function printOrderInvoice(order) {
  const printWindow = window.open("", "_blank", "width=960,height=760");
  if (!printWindow) {
    window.alert("Allow pop-ups to print this invoice.");
    return;
  }
  printWindow.opener = null;
  printWindow.onload = () => printWindow.print();
  printWindow.document.open();
  printWindow.document.write(buildOrderInvoiceHtml(order));
  printWindow.document.close();
  printWindow.focus();
}
