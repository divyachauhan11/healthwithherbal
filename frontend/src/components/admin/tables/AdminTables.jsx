import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  Ban,
  Eye,
  EyeOff,
  Heart,
  MoreVertical,
  Download,
  Printer,
  MessageCircle,
  Pencil,
  Star,
  Trash2,
  X,
  ShoppingBag,
} from "lucide-react";
import { adminRequest } from "@/lib/admin-api";
import { classStatus, currency, dateLabel, dateLabelLong, dateTimeLabel } from "../global/admin-utils";
import { ORDER_STATUSES, REVIEW_STATUSES } from "../../../constants/statuses";
import { getAdminSessionToken } from "../../../lib/session";
import { DataTable } from "./DataTable";
import { TablePagination, useTablePagination } from "./TablePagination";
import { DeleteConfirmationModal } from "../global/DeleteConfirmationModal";

const STORE_TIME_ZONE = process.env.NEXT_PUBLIC_STORE_TIME_ZONE || "Asia/Kolkata";

const storeCalendarDate = (date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: STORE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
};

const isCouponExpired = (expiresAt) => {
  if (!expiresAt) return false;
  const expiryDate = new Date(expiresAt);
  if (Number.isNaN(expiryDate.getTime())) return false;
  return expiryDate.toISOString().slice(0, 10) < storeCalendarDate(new Date());
};

export function RowActionsMenu({
  onEdit,
  onHide,
  hideLabel = "Hide",
  hideIcon: HideIcon,
  hideVariant = "warning",
  onDelete,
  editLabel = "Edit",
  editIcon: EditIcon = Pencil,
  deleteLabel = "Delete",
  extraActions = [],
  align = "right",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState(null);
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (
        !menuRef.current?.contains(event.target) &&
        !dropdownRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    const handleScroll = () => setIsOpen(false);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  const toggle = (e) => {
    e.stopPropagation();
    if (!isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const actionCount = [onEdit, onHide, ...extraActions, onDelete].filter(Boolean).length;
      const estimatedHeight = actionCount * 34 + 12;
      const spaceBelow = window.innerHeight - rect.bottom;
      const shouldOpenUpwards = spaceBelow < estimatedHeight && rect.top > estimatedHeight;
      setOpenUpwards(shouldOpenUpwards);
      setDropdownPosition({
        position: "fixed",
        ...(align === "left"
          ? { left: rect.left }
          : { right: window.innerWidth - rect.right }),
        top: shouldOpenUpwards
          ? Math.max(8, rect.top - estimatedHeight - 4)
          : rect.bottom + 4,
        maxHeight: "calc(100vh - 16px)",
        zIndex: 100000,
      });
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <div
      className={`row-actions-container ${isOpen ? "active" : ""}`}
      ref={menuRef}
      style={{ position: "relative", display: "inline-block" }}
    >
      <button
        type="button"
        className="action-dots-btn"
        aria-label="Actions"
        aria-expanded={isOpen}
        onClick={toggle}
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && dropdownPosition && typeof document !== "undefined" && createPortal(
        <div
          ref={dropdownRef}
          className={`row-actions-dropdown ${openUpwards ? "upwards" : "downwards"}`}
          style={dropdownPosition}
          onClick={(e) => e.stopPropagation()}
        >
          {onEdit && (
            <button
              type="button"
              className="row-action-item"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onEdit();
              }}
            >
              <EditIcon size={13} />
              <span>{editLabel}</span>
            </button>
          )}

          {onHide && (
            <button
              type="button"
              className={`row-action-item ${hideVariant || ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onHide();
              }}
            >
              {HideIcon ? <HideIcon size={13} /> : <EyeOff size={13} />}
              <span>{hideLabel}</span>
            </button>
          )}

          {extraActions.map((action, idx) => (
            <button
              key={idx}
              type="button"
              className={`row-action-item ${action.danger ? "danger" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                action.onClick?.();
              }}
            >
              {action.icon && <action.icon size={13} />}
              <span>{action.label}</span>
            </button>
          ))}

          {onDelete && (
            <button
              type="button"
              className="row-action-item danger"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onDelete();
              }}
            >
              <Trash2 size={13} />
              <span>{deleteLabel}</span>
            </button>
          )}
        </div>,
        menuRef.current?.closest(".admin-shell") || document.body,
      )}
    </div>
  );
}

function OrderItemsCell({ items = [] }) {
  if (!items || !items.length) {
    return <span className="muted">—</span>;
  }

  const itemsList = Array.isArray(items) ? items : [items];
  const fullSummary = itemsList
    .map(
      (item) =>
        `${item.title || item.name || "Product"} ×${item.quantity || 1}`,
    )
    .join(", ");

  return (
    <div className="order-items-cell" title={fullSummary}>
      <div className="order-items-list">
        <div className="order-item-chip">
          <span className="order-item-title">{itemsList[0].title || itemsList[0].name || "Product"}</span>
          <span className="order-item-qty">×{itemsList[0].quantity || 1}</span>
        </div>
        {itemsList.length > 1 && <span className="order-items-more">+{itemsList.length - 1} more</span>}
      </div>
    </div>
  );
}

const escapeInvoiceHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

function buildOrderInvoiceHtml(order) {
  const amount = (value) => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: order.currency || "INR",
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);
  const customer = order.customer || {};
  const shipping = order.shippingAddress || customer;
  const billing = order.billingAddress || shipping;
  const customerName = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.name || "—";
  const address = (value) => [value?.street || value?.line1, value?.line2, value?.city, value?.state, value?.postalCode, value?.country].filter(Boolean).join(", ") || "—";
  const orderDate = dateLabelLong(order.createdAt);
  const itemRows = (order.items || []).map((item) => `<tr><td><strong>${escapeInvoiceHtml(item.title || item.titleSnapshot || item.name || "Product")}</strong><small>${escapeInvoiceHtml(item.brand || item.brandSnapshot || "")}</small></td><td>${escapeInvoiceHtml(item.sku || item.skuSnapshot || item.legacyId || "—")}</td><td class="numeric">${Number(item.quantity) || 1}</td><td class="numeric">${amount(item.unitPrice)}</td><td class="numeric">${amount(item.lineTotal ?? Number(item.unitPrice || 0) * Number(item.quantity || 1))}</td></tr>`).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Invoice ${escapeInvoiceHtml(order.orderNumber)}</title><style>
    *{box-sizing:border-box}body{margin:0;padding:36px;background:#f4f1eb;color:#30251d;font:14px Arial,sans-serif}.invoice{max-width:900px;margin:auto;padding:42px;background:#fff;border:1px solid #e8dfd2;border-radius:12px}.head{display:flex;justify-content:space-between;gap:20px;padding-bottom:24px;border-bottom:2px solid #4a2413}.brand{font-size:23px;font-weight:700;color:#4a2413}.brand small{display:block;margin-top:7px;color:#85796d;font-size:11px;font-weight:400}.title{text-align:right}.title span{color:#92714e;font-size:11px;text-transform:uppercase;letter-spacing:.1em}.title h1{margin:5px 0;color:#4a2413;font:700 30px Georgia,serif}.title b{font-size:12px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:24px 0}.card{padding:16px;border:1px solid #ebe4da;border-radius:8px}.card h2{margin:0 0 12px;font-size:14px;color:#4a2413}.card p{margin:5px 0;color:#51463c;line-height:1.5;overflow-wrap:anywhere}.card strong{color:#30251d}table{width:100%;border-collapse:collapse;margin-top:14px;text-align:left}th{padding:11px 8px;background:#f7f3ec;color:#776757;font-size:10px;text-transform:uppercase;letter-spacing:.06em}td{padding:12px 8px;border-bottom:1px solid #eee8df;font-size:12px}td small{display:block;margin-top:4px;color:#82766a}.numeric{text-align:right;white-space:nowrap}.totals{width:min(360px,100%);margin:22px 0 0 auto}.totals div{display:flex;justify-content:space-between;padding:7px 0;color:#6f6257}.totals .grand{margin-top:6px;padding-top:12px;border-top:1px solid #ddd2c3;color:#30251d;font-weight:700;font-size:16px}.note{margin-top:22px;padding:14px;background:#faf7f1;border-radius:8px;color:#66594f}.foot{margin-top:30px;padding-top:16px;border-top:1px solid #eee8df;text-align:center;color:#887a6b;font-size:11px}.toolbar{max-width:900px;margin:0 auto 14px;text-align:right}.toolbar button{border:0;border-radius:7px;padding:10px 16px;background:#4a2413;color:#fff;font-weight:700;cursor:pointer}@media print{body{padding:0;background:#fff}.invoice{max-width:none;border:0;border-radius:0;padding:12mm;box-shadow:none}.toolbar{display:none}}
    </style></head><body><div class="toolbar"><button onclick="window.print()">Print invoice</button></div><main class="invoice"><header class="head"><div class="brand">Health With Herbal<small>Order invoice</small></div><div class="title"><span>Invoice</span><h1>INVOICE</h1><b>${escapeInvoiceHtml(order.orderNumber || "—")}</b></div></header><section class="grid"><article class="card"><h2>Customer & delivery</h2><p><strong>${escapeInvoiceHtml(customerName)}</strong></p><p>${escapeInvoiceHtml(customer.email || order.guestEmail || "—")}</p><p>${escapeInvoiceHtml(customer.phone || shipping.phone || "—")}</p><p>${escapeInvoiceHtml(address(shipping))}</p></article><article class="card"><h2>Order information</h2><p>Order date: <strong>${escapeInvoiceHtml(orderDate)}</strong></p><p>Status: <strong>${escapeInvoiceHtml(order.status || "—")}</strong></p><p>Payment: <strong>${escapeInvoiceHtml(String(order.paymentMethod || "Cash on delivery").replaceAll("_", " "))}</strong></p><p>Billing: ${escapeInvoiceHtml(address(billing))}</p>${order.trackingId ? `<p>Tracking ID: ${escapeInvoiceHtml(order.trackingId)}</p>` : ""}</article></section><h2>Order items</h2><table><thead><tr><th>Item</th><th>SKU</th><th class="numeric">Qty</th><th class="numeric">Unit price</th><th class="numeric">Line total</th></tr></thead><tbody>${itemRows || `<tr><td colspan="5">No items listed.</td></tr>`}</tbody></table><section class="totals"><div><span>Subtotal</span><strong>${amount(order.subtotal)}</strong></div>${Number(order.discount) > 0 ? `<div><span>Discount${order.couponCode ? ` (${escapeInvoiceHtml(order.couponCode)})` : ""}</span><strong>−${amount(order.discount)}</strong></div>` : ""}<div><span>Shipping</span><strong>${Number(order.shipping ?? order.shippingFee) === 0 ? "Free" : amount(order.shipping ?? order.shippingFee)}</strong></div><div class="grand"><span>Total</span><strong>${amount(order.total)}</strong></div></section>${order.orderNote ? `<div class="note"><strong>Delivery note:</strong> ${escapeInvoiceHtml(order.orderNote)}</div>` : ""}<footer class="foot">Thank you for choosing Health With Herbal.</footer></main></body></html>`;
}

function downloadOrderInvoice(order) {
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

function printOrderInvoice(order) {
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

function OrderDetailsModal({ order, onClose }) {
  useEffect(() => {
    if (!order) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [order, onClose]);

  if (!order || typeof document === "undefined") return null;
  const address = order.shippingAddress || order.customer || {};
  const billing = order.billingAddress || address;
  const customerName = [order.customer?.firstName, order.customer?.lastName]
    .filter(Boolean)
    .join(" ") || "Customer";
  const formatAmount = (amount) => currency(Number(amount) || 0, order.currency || "INR");
  const formatDateTime = dateTimeLabel;
  const addressText = (value) => [
    value?.street || value?.line1 || value?.addressLine1,
    value?.line2,
    value?.addressLine2,
    value?.city,
    value?.state,
    value?.postalCode,
    value?.country,
  ].filter(Boolean).join(", ") || "No address provided";

  return createPortal(
    <div className="order-detail-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <section className="order-detail-modal" role="dialog" aria-modal="true" aria-labelledby="order-detail-title">
        <header className="order-detail-header">
          <div>
            <span className="order-detail-eyebrow">Order details</span>
            <h2 id="order-detail-title">#{order.orderNumber || "Order"}</h2>
            <p>Placed {formatDateTime(order.createdAt)}</p>
          </div>
          <button type="button" className="order-detail-close" onClick={onClose} aria-label="Close order details"><X size={20} /></button>
        </header>

        <div className="order-detail-content">
          <div className="order-detail-summary-grid">
            <article><span>Order status</span><strong className={`order-detail-status ${classStatus(order.status)}`}>{order.status || "—"}</strong></article>
            <article><span>Payment method</span><strong>{String(order.paymentMethod || "Cash on delivery").replaceAll("_", " ")}</strong></article>
            <article><span>Payment status</span><strong>{order.paymentStatus || (order.paymentMethod === "cash_on_delivery" ? "Due on delivery" : "—")}</strong></article>
            <article><span>Tracking ID</span><strong>{order.trackingId || "Not assigned"}</strong></article>
          </div>

          <div className="order-detail-two-col">
            <section className="order-detail-card">
              <h3>Customer</h3>
              <strong>{customerName}</strong>
              <p>{order.customer?.email || order.guestEmail || "No email provided"}</p>
              <p>{order.customer?.phone || order.phone || "No phone provided"}</p>
            </section>
            <section className="order-detail-card">
              <h3>Delivery address</h3>
              <p>{address.fullName || customerName}</p>
              <p>{addressText(address)}</p>
              {(address.phone || address.mobile) && <p>{address.phone || address.mobile}</p>}
            </section>
            {order.billingAddress && (
              <section className="order-detail-card">
                <h3>Billing address</h3>
                <p>{addressText(billing)}</p>
              </section>
            )}
            <section className="order-detail-card">
              <h3>Order information</h3>
              <p>Updated {formatDateTime(order.updatedAt)}</p>
              {order.orderNote && <p>Note: {order.orderNote}</p>}
              {order.couponCode && <p>Coupon: {order.couponCode}</p>}
            </section>
          </div>

          <section className="order-detail-items">
            <div className="order-detail-section-heading"><h3>Items</h3><span>{(order.items || []).length} {(order.items || []).length === 1 ? "product" : "products"}</span></div>
            {(order.items || []).map((item, index) => (
              <article className="order-detail-item" key={`${item.product || item.legacyId || index}`}>
                {item.image ? <img src={item.image} alt="" /> : <span className="order-detail-item-image"><ShoppingBag size={18} /></span>}
                <div><strong>{item.title || item.name || "Product"}</strong><small>{item.brand || ""}{item.legacyId ? ` · SKU ${item.legacyId}` : ""}</small><small>{formatAmount(item.unitPrice)} × {item.quantity || 1}</small></div>
                <b>{formatAmount(item.lineTotal ?? Number(item.unitPrice || 0) * Number(item.quantity || 1))}</b>
              </article>
            ))}
          </section>

          <section className="order-detail-totals">
            <div><span>Subtotal</span><strong>{formatAmount(order.subtotal)}</strong></div>
            <div><span>Shipping</span><strong>{formatAmount(order.shipping ?? order.shippingFee)}</strong></div>
            {Number(order.discount) > 0 && <div><span>Discount</span><strong>−{formatAmount(order.discount)}</strong></div>}
            <div className="order-detail-grand-total"><span>Total</span><strong>{formatAmount(order.total)}</strong></div>
          </section>
        </div>
      </section>
    </div>,
    document.body,
  );
}

export function OrderTable({
  rows = [],
  compact = false,
  onStatus,
  pageSize: initialPageSize = 10,
}) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const updateStatus = async (id, status) => {
    try {
      await adminRequest(`/orders/${id}`, {
        token: getAdminSessionToken(),
        method: "PATCH",
        body: { status },
      });
      // Broadcast real-time event to open storefront tabs and customer windows
      if (typeof window !== "undefined") {
        try {
          const bc = new BroadcastChannel("hwh_order_status");
          bc.postMessage({ id, status, timestamp: Date.now() });
          bc.close();
        } catch {}
        try {
          localStorage.setItem(
            "hwh_order_status_update",
            JSON.stringify({ id, status, timestamp: Date.now() }),
          );
        } catch {}
      }
      onStatus?.();
    } catch (error) {
      window.alert(error.message);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "orderNumber",
        label: "Order",
        className: "th-order",
        cellClassName: "cell-order",
        sortable: true,
        render: (order) => (
          <button
            type="button"
            className="order-number-link"
            onClick={() => setSelectedOrder(order)}
            aria-label={`View order ${order.orderNumber} details`}
          >
            #{order.orderNumber}
          </button>
        ),
      },
      {
        key: "customer",
        label: "Customer",
        className: "th-customer",
        cellClassName: "cell-customer",
        sortable: true,
        sortFn: (a, b) =>
          (a.customer?.firstName || "").localeCompare(
            b.customer?.firstName || "",
          ),
        render: (order) => (
          <div>
            <span className="customer-name">
              {order.customer?.firstName} {order.customer?.lastName}
            </span>
            <small className="cell-subtitle">
              {order.customer?.email || "—"}
            </small>
          </div>
        ),
      },
      {
        key: "items",
        label: "Items",
        className: "th-items",
        cellClassName: "cell-items",
        hide: compact,
        render: (order) => <OrderItemsCell items={order.items} />,
      },
      {
        key: "address",
        label: "Address",
        className: "th-address",
        cellClassName: "cell-address",
        hide: compact,
        render: (order) =>
          order.customer?.city || order.customer?.country ? (
            <span>
              {order.customer?.city ? `${order.customer.city}, ` : ""}
              {order.customer?.country || ""}
            </span>
          ) : (
            <span className="muted">—</span>
          ),
      },
      {
        key: "total",
        label: "Total",
        className: "th-total",
        cellClassName: "cell-total",
        sortable: true,
        sortFn: (a, b) => (a.total || 0) - (b.total || 0),
        render: (order) => (
          <b>{currency(order.total, order.currency || "INR")}</b>
        ),
      },
      {
        key: "status",
        label: "Status",
        className: "th-status",
        cellClassName: "cell-status",
        sortable: true,
        render: (order) => (
          <select
            className={`status-select ${classStatus(order.status)}`}
            value={order.status}
            onChange={(event) => updateStatus(order._id, event.target.value)}
            aria-label={`Update order ${order.orderNumber} status`}
          >
            {ORDER_STATUSES.map(
              (status) => (
                <option value={status} key={status}>
                  {status}
                </option>
              ),
            )}
          </select>
        ),
      },
      {
        key: "createdAt",
        label: "Date",
        className: "th-date",
        cellClassName: "cell-date muted",
        sortable: true,
        render: (order) => dateLabel(order.createdAt),
      },
      {
        key: "details",
        label: "Actions",
        className: "th-order-details",
        cellClassName: "cell-order-details",
        hide: compact,
        render: (order) => (
          <RowActionsMenu
            extraActions={[
              { label: "View details", icon: Eye, onClick: () => setSelectedOrder(order) },
              { label: "Download invoice", icon: Download, onClick: () => downloadOrderInvoice(order) },
              { label: "Print invoice", icon: Printer, onClick: () => printOrderInvoice(order) },
            ]}
          />
        ),
      },
    ],
    [compact],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        pageSize={initialPageSize}
        pageSizeOptions={compact ? [7, 10, 20] : [10, 25, 50]}
        emptyMessage="No orders found yet."
      />
      <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </>
  );
}

export function ProductTable({
  rows = [],
  onEdit,
  onDelete,
  onToggleStatus,
  pageSize: initialPageSize = 10,
}) {
  const columns = useMemo(
    () => [
      {
        key: "title",
        label: "Product",
        sortable: true,
        render: (product) => (
          <div className="product-cell">
            <div className="product-thumb">
              {product.image || product.images?.[0] ? (
                <img
                  src={product.image || product.images?.[0]}
                  alt={product.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                />
              ) : (
                product.title?.slice(0, 1)
              )}
            </div>
            <div>
              <b>{product.title}</b>
              {product.images?.length > 1 && (
                <small className="product-photo-count">
                  +{product.images.length - 1} photos
                </small>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "sku",
        label: "SKU",
        cellClassName: "muted",
        sortable: true,
        render: (product) => product.sku || "—",
      },
      {
        key: "brand",
        label: "Brand",
        sortable: true,
        render: (product) => product.brand || "—",
      },
      {
        key: "category",
        label: "Category",
        sortable: true,
        render: (product) => product.category || "—",
      },
      {
        key: "stockQty",
        label: "Stock",
        sortable: true,
        render: (product) => product.stockQty ?? 0,
      },
      {
        key: "price",
        label: "Price",
        sortable: true,
        render: (product) => <b>{currency(product.price)}</b>,
      },
      {
        key: "badge",
        label: "Badge",
        sortable: true,
        render: (product) => {
          if (!product.badge) return <span style={{ color: "#9ca3af" }}>—</span>;
          const badges = product.badge
            .split(",")
            .map((b) => b.trim())
            .filter(Boolean);
          if (!badges.length) return <span style={{ color: "#9ca3af" }}>—</span>;

          const firstBadge = badges[0];
          const isNew = firstBadge.toLowerCase().includes("new");
          return (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }} title={badges.join(", ")}>
              <span
                className={`badge-tag ${isNew ? "badge-new" : ""}`}
                style={{
                  display: "inline-block",
                  maxWidth: "150px",
                  overflow: "hidden",
                  padding: "3px 8px",
                  borderRadius: "5px",
                  fontSize: "10px",
                  fontWeight: 700,
                  textOverflow: "ellipsis",
                  textTransform: "uppercase",
                  background: isNew ? "#ecfeff" : "#fef3c7",
                  color: isNew ? "#0e7490" : "#92400e",
                  border: isNew ? "1px solid #a5f3fc" : "1px solid #fde68a",
                }}
              >
                {firstBadge}
              </span>
              {badges.length > 1 && (
                <small style={{ color: "#69766f", fontSize: "11px", fontWeight: 600 }}>
                  +{badges.length - 1}
                </small>
              )}
            </div>
          );
        },
      },
      {
        key: "active",
        label: "Status",
        sortable: true,
        render: (product) => {
          const isPaused = product.active === false;
          return (
            <span
              className={`status ${isPaused ? "paused" : ""}`}
              title={
                isPaused
                  ? "Paused / Hidden from customer storefront. Click 3 dots to unhide."
                  : "Active and visible in storefront. Click 3 dots to hide."
              }
            >
              {isPaused ? "Paused" : "Active"}
            </span>
          );
        },
      },
      {
        key: "actions",
        label: "Actions",
        align: "right",
        render: (product) => {
          const isPaused = product.active === false;
          return (
            <RowActionsMenu
              onEdit={() => onEdit(product)}
              onHide={
                onToggleStatus ? () => onToggleStatus(product) : undefined
              }
              hideLabel={isPaused ? "Unhide product" : "Hide product"}
              hideIcon={isPaused ? Eye : EyeOff}
              hideVariant={isPaused ? "success" : "warning"}
              onDelete={() => onDelete(product)}
              editLabel="Edit"
              deleteLabel="Delete"
            />
          );
        },
      },
    ],
    [onEdit, onDelete, onToggleStatus],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      pageSize={initialPageSize}
      tableClassName="product-table"
      emptyMessage="No products match this search."
    />
  );
}

export function CouponTable({
  rows = [],
  onEdit,
  onDelete,
  pageSize: initialPageSize = 10,
}) {
  const columns = useMemo(
    () => [
      {
        key: "code",
        label: "Code",
        sortable: true,
        render: (coupon) => <b>{coupon.code}</b>,
      },
      {
        key: "description",
        label: "Description",
        cellClassName: "coupon-desc-cell",
        render: (coupon) => coupon.description || "—",
      },
      {
        key: "discountType",
        label: "Type",
        sortable: true,
      },
      {
        key: "discountValue",
        label: "Value",
        sortable: true,
        render: (coupon) =>
          coupon.discountType === "percent"
            ? `${coupon.discountValue}%`
            : currency(coupon.discountValue),
      },
      {
        key: "usedCount",
        label: "Used",
        sortable: true,
        render: (coupon) =>
          `${coupon.usedCount || 0}${coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}`,
      },
      {
        key: "expiresAt",
        label: "Expires",
        sortable: true,
        render: (coupon) => dateLabel(coupon.expiresAt),
      },
      {
        key: "isActive",
        label: "Status",
        sortable: true,
        render: (coupon) => {
          const expired = isCouponExpired(coupon.expiresAt);
          const status = expired
            ? "Expired"
            : coupon.isActive
              ? "Active"
              : "Paused";
          return (
            <span className={`status ${expired || !coupon.isActive ? "paused" : ""}`}>
              {status}
            </span>
          );
        },
      },
      {
        key: "actions",
        label: "Actions",
        align: "right",
        render: (coupon) => (
          <RowActionsMenu
            onEdit={onEdit ? () => onEdit(coupon) : undefined}
            onDelete={() => onDelete(coupon)}
            editLabel="Edit"
            deleteLabel="Delete"
          />
        ),
      },
    ],
    [onEdit, onDelete],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      pageSize={initialPageSize}
      emptyMessage="No coupons created yet."
    />
  );
}

export function ReviewTable({
  rows = [],
  token,
  onChange,
  notify,
  onDelete,
  pageSize: initialPageSize = 10,
}) {
  const [internalDeleteReview, setInternalDeleteReview] = useState(null);
  const [busy, setBusy] = useState(false);

  const action = async (review, isApproved, status) => {
    try {
      await adminRequest(`/reviews/${review._id}`, {
        token,
        method: "PATCH",
        body: {
          isApproved,
          status: status || (isApproved ? REVIEW_STATUSES[1] : REVIEW_STATUSES[2]),
        },
      });
      onChange?.();
      notify(
        isApproved
          ? "Review approved and published to store."
          : "Review rejected/hidden from store.",
        "success",
      );
    } catch (error) {
      notify(error.message, "error");
    }
  };

  const confirmDeleteReview = async () => {
    if (!internalDeleteReview) return;
    setBusy(true);
    try {
      await adminRequest(`/reviews/${internalDeleteReview._id}`, {
        token,
        method: "DELETE",
      });
      onChange?.();
      notify("Review deleted.", "success");
      setInternalDeleteReview(null);
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "userId.name",
        label: "Customer",
        sortable: true,
        render: (review) => (
          <div>
            <b>{review.userId?.name || review.userName || "Customer"}</b>
            {(review.userEmail || review.orderNumber) && (
              <small className="cell-subtitle" style={{ display: "block" }}>
                {review.userEmail} {review.orderNumber ? `(#${review.orderNumber})` : ""}
              </small>
            )}
          </div>
        ),
      },
      {
        key: "productId.title",
        label: "Product",
        sortable: true,
        render: (review) => review.productId?.title || "Product",
      },
      {
        key: "rating",
        label: "Rating",
        sortable: true,
        render: (review) => (
          <span className="rating">
            <Star size={12} fill="currentColor" /> {review.rating}
          </span>
        ),
      },
      {
        key: "comment",
        label: "Review",
        cellClassName: "review-copy",
        render: (review) => (
          <div>
            {review.title && <strong style={{ display: "block", marginBottom: 2 }}>{review.title}</strong>}
            <span>{review.comment || "—"}</span>
          </div>
        ),
      },
      {
        key: "isApproved",
        label: "Status",
        sortable: true,
        render: (review) => (
          <span
            className={`status ${review.isApproved ? "" : review.status === REVIEW_STATUSES[2] ? "paused" : "processing"}`}
          >
            {review.isApproved
              ? "Approved"
              : review.status === REVIEW_STATUSES[2]
              ? "Rejected"
              : "Pending"}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        align: "right",
        render: (review) => (
          <RowActionsMenu
            extraActions={[
              ...(review.isApproved
                ? [
                    {
                      label: "Reject / Hide review",
                      icon: EyeOff,
                      onClick: () => action(review, false, REVIEW_STATUSES[2]),
                    },
                  ]
                : [
                    {
                      label: "Approve (Publish to store)",
                      icon: CheckCircle2,
                      onClick: () => action(review, true, REVIEW_STATUSES[1]),
                    },
                    ...(review.status !== REVIEW_STATUSES[2]
                      ? [
                          {
                            label: "Reject review",
                            icon: EyeOff,
                            onClick: () => action(review, false, REVIEW_STATUSES[2]),
                          },
                        ]
                      : []),
                  ]),
            ]}
            onDelete={() =>
              onDelete ? onDelete(review) : setInternalDeleteReview(review)
            }
            deleteLabel="Delete"
          />
        ),
      },
    ],
    [token, onChange, notify, onDelete],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        pageSize={initialPageSize}
        emptyMessage="No product reviews available."
      />
      {!onDelete && (
        <DeleteConfirmationModal
          isOpen={Boolean(internalDeleteReview)}
          item={internalDeleteReview}
          kind="reviews"
          busy={busy}
          onClose={() => setInternalDeleteReview(null)}
          onConfirm={confirmDeleteReview}
        />
      )}
    </>
  );
}

export function CustomerTable({ rows = [], pageSize: initialPageSize = 10, onView, onSuspend }) {
  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Customer",
        sortable: true,
        render: (customer) => <b>{customer.name || "Customer"}</b>,
      },
      {
        key: "email",
        label: "Email",
        sortable: true,
        render: (customer) => customer.email || "—",
      },
      {
        key: "orders",
        label: "Orders",
        sortable: true,
        render: (customer) => customer.orders ?? 0,
      },
      {
        key: "spent",
        label: "Total spent",
        sortable: true,
        render: (customer) => <b>{currency(customer.spent)}</b>,
      },
      {
        key: "lastOrder",
        label: "Last order",
        sortable: true,
        render: (customer) => dateLabel(customer.lastOrder),
      },
      {
        key: "details",
        label: "Actions",
        align: "right",
        render: (customer) => (
          <RowActionsMenu
            onEdit={() => onView?.(customer)}
            editLabel="View details"
            editIcon={Eye}
            extraActions={customer.hasAccount ? [{
              label: customer.isActive === false ? "Reactivate customer" : "Suspend customer",
              icon: customer.isActive === false ? CheckCircle2 : Ban,
              danger: customer.isActive !== false,
              onClick: () => onSuspend?.(customer),
            }] : []}
            align="right"
          />
        ),
      },
    ],
    [onView, onSuspend],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      pageSize={initialPageSize}
      emptyMessage="No customer accounts or order customers found."
    />
  );
}

export function BlogTable({
  rows = [],
  onEdit,
  onDelete,
  onManageComments,
  pageSize: initialPageSize = 10,
}) {
  const { page, setPage, pageSize, setPageSize, displayedRows, totalItems } =
    useTablePagination(rows, initialPageSize);

  return (
    <div className="blog-card-manager">
      {displayedRows.length ? (
        <div className="blog-admin-card-grid">
          {displayedRows.map((blog) => (
            <article className="blog-admin-card" key={blog._id || blog.slug}>
              <div className="blog-admin-card-cover">
                {blog.coverImage || blog.image ? (
                  <img src={blog.coverImage || blog.image} alt={blog.title || "Blog cover"} />
                ) : (
                  <div className="blog-admin-card-placeholder"><Star size={34} /></div>
                )}
                <span className="blog-admin-card-category">{blog.category || blog.tags?.[0] || "Wellness"}</span>
                <span className={`blog-admin-card-status ${blog.status === "published" ? "published" : "draft"}`}>{blog.status || "draft"}</span>
              </div>
              <div className="blog-admin-card-body">
                <div className="blog-admin-card-date">{dateLabel(blog.publishedAt || blog.updatedAt || blog.createdAt)}</div>
                <h2>{blog.title}</h2>
                <p>{blog.excerpt || "No excerpt has been added yet."}</p>
                {!!blog.tags?.length && (
                  <div className="blog-admin-card-tags">
                    {blog.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}
                    {blog.tags.length > 3 && <small>+{blog.tags.length - 3} more</small>}
                  </div>
                )}
              </div>
              <div className="blog-admin-card-footer">
                <div className="blog-admin-card-metrics">
                  <span title="Likes"><Heart size={14} /> {blog.likesCount || 0}</span>
                  <span title="Views"><Eye size={14} /> {blog.viewsCount || 0}</span>
                  <button
                    type="button"
                    className="blog-admin-comment-count"
                    title={blog.pendingCommentsCount ? `${blog.pendingCommentsCount} new comments awaiting approval` : "Manage comments"}
                    aria-label={`${blog.commentsCount || 0} comments${blog.pendingCommentsCount ? `, ${blog.pendingCommentsCount} new awaiting approval` : ""}`}
                    onClick={() => onManageComments?.(blog)}
                  >
                    <MessageCircle size={14} /> {blog.commentsCount || 0}
                    {!!blog.pendingCommentsCount && <small className="blog-admin-pending-count">{blog.pendingCommentsCount} new</small>}
                  </button>
                </div>
                <div className="blog-admin-card-actions">
                  {onEdit && <button type="button" aria-label="Edit blog post" title="Edit" onClick={() => onEdit(blog)}><Pencil size={15} /></button>}
                  {onDelete && <button type="button" className="delete" aria-label="Delete blog post" title="Delete" onClick={() => onDelete(blog)}><Trash2 size={15} /></button>}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="blog-admin-card-empty">No blog posts match your search.</div>
      )}
      <TablePagination
        totalItems={totalItems}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}

export function UserTable({ rows = [], pageSize: initialPageSize = 10, onEdit, onDelete, currentUserId, currentUserEmail }) {
  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Name",
        sortable: true,
        render: (person) => <b>{person.name}</b>,
      },
      {
        key: "email",
        label: "Email",
        sortable: true,
        render: (person) => person.email || "—",
      },
      {
        key: "role",
        label: "Role",
        sortable: true,
        render: (person) => person.role || "—",
      },
      {
        key: "isActive",
        label: "Status",
        sortable: true,
        render: (person) => (
          <span className={`status ${person.isActive ? "" : "paused"}`}>
            {person.isActive ? "Active" : "Disabled"}
          </span>
        ),
      },
      {
        key: "createdAt",
        label: "Created",
        sortable: true,
        render: (person) => dateLabel(person.createdAt),
      },
      {
        key: "actions",
        label: "Action",
        render: (person) => {
          const isCurrentUser = Boolean(
            (currentUserId && String(person._id || person.id || "") === String(currentUserId)) ||
            (currentUserEmail && String(person.email || "").trim().toLowerCase() === String(currentUserEmail).trim().toLowerCase()),
          );
          return (
            <RowActionsMenu
              onEdit={onEdit ? () => onEdit(person) : undefined}
              onDelete={onDelete && !isCurrentUser ? () => onDelete(person) : undefined}
            />
          );
        },
      },
    ],
    [onEdit, onDelete, currentUserId, currentUserEmail],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      pageSize={initialPageSize}
      emptyMessage="No admin or employee accounts found."
    />
  );
}
