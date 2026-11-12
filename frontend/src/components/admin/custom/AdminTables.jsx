import { useState, useRef, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  HeartPulse,
  Pill,
  Eye,
  EyeOff,
  MoreVertical,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { adminRequest } from "../../../lib/admin-api";
import { classStatus, currency, dateLabel } from "../global/admin-utils";
import { DataTable } from "../global/DataTable";
import { Modal } from "../global/Modal";
import { TablePagination, useTablePagination } from "../global/TablePagination";
import { DeleteConfirmationModal } from "../global/DeleteConfirmationModal";

export { TablePagination, useTablePagination };

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
  deleteLabel = "Delete",
  extraActions = [],
  align = "right",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const toggle = (e) => {
    e.stopPropagation();
    if (!isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 170 && rect.top > 170);
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

      {isOpen && (
        <div
          className={`row-actions-dropdown ${openUpwards ? "upwards" : "downwards"}`}
          style={{
            position: "absolute",
            [align === "left" ? "left" : "right"]: 0,
            [openUpwards ? "bottom" : "top"]: "calc(100% + 4px)",
            zIndex: 1000,
          }}
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
              <Pencil size={13} />
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
        </div>
      )}
    </div>
  );
}

function OrderItemsCell({ items = [] }) {
  const [expanded, setExpanded] = useState(false);

  if (!items || !items.length) {
    return <span className="muted">—</span>;
  }

  const itemsList = Array.isArray(items) ? items : [items];
  const maxVisible = 2;
  const hasMore = itemsList.length > maxVisible;
  const visibleItems = expanded ? itemsList : itemsList.slice(0, maxVisible);
  const remainingCount = itemsList.length - maxVisible;

  const fullSummary = itemsList
    .map(
      (item) =>
        `${item.title || item.name || "Product"} ×${item.quantity || 1}`,
    )
    .join(", ");

  return (
    <div
      className="order-items-cell"
      title={!expanded ? fullSummary : undefined}
    >
      <div className="order-items-list">
        {visibleItems.map((item, idx) => {
          const title = item.title || item.name || "Product";
          const qty = item.quantity || 1;
          return (
            <div
              key={idx}
              className="order-item-chip"
              title={`${title} ×${qty}`}
            >
              <span className="order-item-title">{title}</span>
              <span className="order-item-qty">×{qty}</span>
            </div>
          );
        })}
      </div>
      {hasMore && (
        <button
          type="button"
          className="order-items-toggle-btn"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          title={
            expanded ? "Show fewer items" : `View all ${itemsList.length} items`
          }
        >
          {expanded ? "Show less" : `+${remainingCount} more`}
        </button>
      )}
    </div>
  );
}

export function OrderTable({
  rows = [],
  compact = false,
  onStatus,
  pageSize: initialPageSize = 10,
}) {
  const updateStatus = async (id, status) => {
    try {
      await adminRequest(`/orders/${id}`, {
        token: window.localStorage.getItem("hwh-admin-session"),
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
        render: (order) => <b>#{order.orderNumber}</b>,
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
            {["placed", "processing", "shipped", "delivered", "cancelled"].map(
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
    ],
    [compact],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      pageSize={initialPageSize}
      pageSizeOptions={compact ? [7, 10, 20] : [10, 25, 50]}
      emptyMessage="No orders found yet."
    />
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
                <small
                  className="cell-subtitle"
                  style={{ color: "#347055", fontWeight: 600 }}
                >
                  +{product.images.length - 1} more photo
                  {product.images.length > 2 ? "s" : ""}
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

          return (
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {badges.map((b, idx) => {
                const isNew = b.toLowerCase().includes("new");
                return (
                  <span
                    key={idx}
                    className={`badge-tag ${isNew ? "badge-new" : ""}`}
                    style={{
                      display: "inline-block",
                      padding: "2px 7px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      background: isNew ? "#ecfeff" : "#fef3c7",
                      color: isNew ? "#0e7490" : "#92400e",
                      border: isNew ? "1px solid #a5f3fc" : "1px solid #fde68a",
                    }}
                  >
                    {b}
                  </span>
                );
              })}
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
      emptyMessage="No products match this search."
    />
  );
}

export function CollectionTable({
  kind,
  rows = [],
  categoryView = "categories",
  categoryRows = rows,
  onEdit,
  onDelete,
  onNavigate,
  pageSize: initialPageSize = 10,
}) {
  const [viewedParentCategory, setViewedParentCategory] = useState(null);
  const isCategory = kind === "Categories";
  const isParentCategoryView = isCategory && categoryView === "parents";
  const viewedSubcategories = viewedParentCategory
    ? categoryRows.filter((category) => String(category.parentId) === String(viewedParentCategory._id))
    : [];
  const viewedProductCount = viewedSubcategories.reduce((total, category) => total + Number(category.productCount || 0), 0);

  const columns = useMemo(
    () => [
      {
        key: "name",
        label: isCategory ? "Category" : "Brand",
        sortable: true,
        render: (item) => (
          <div className="product-cell">
            {item.image || item.logoUrl || item.images?.[0] ? (
              <div className="product-thumb">
                <img
                  src={item.image || item.logoUrl || item.images?.[0]}
                  alt={item.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                />
              </div>
            ) : kind === "Brands" ? (
              <div className="product-thumb">{item.name?.slice(0, 1)}</div>
            ) : null}
            <div>
              {isCategory ? (
                <button
                  type="button"
                  className="category-name-link"
                  title={item.isParent ? `View categories under ${item.name}` : `View products in ${item.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (item.isParent) setViewedParentCategory(item);
                    else onNavigate?.("Products", item.name);
                  }}
                >
                  {item.name}
                </button>
              ) : <b>{item.name}</b>}
              {item.images?.length > 1 && (
                <small
                  className="cell-subtitle"
                  style={{ color: "#347055", fontWeight: 600 }}
                >
                  +{item.images.length - 1} photo
                  {item.images.length > 2 ? "s" : ""}
                </small>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "slug",
        label: "Slug",
        cellClassName: "muted",
        sortable: true,
        render: (item) => item.slug,
      },
      ...(isCategory
        ? [
            {
              key: "type",
              label: "Type / Section",
              sortable: true,
              render: (item) => {
                if (item.isParent) return <span className="category-parent-badge">Parent category</span>;
                const isConcern = item.type === "concern";
                return (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "3px 9px",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: isConcern ? "#fef3c7" : "#ecfdf5",
                      color: isConcern ? "#92400e" : "#065f46",
                      border: `1px solid ${isConcern ? "#fde68a" : "#a7f3d0"}`,
                    }}
                  >
                    {isConcern ? <HeartPulse size={12} /> : <Pill size={12} />}
                    {isConcern ? "Health Concern" : "Product Form"}
                  </span>
                );
              },
            },
            {
              key: isParentCategoryView ? "categoryCount" : "parentId",
              label: isParentCategoryView ? "Category count" : "Parent category",
              sortable: true,
              sortFn: isParentCategoryView
                ? (a, b) => categoryRows.filter((category) => String(category.parentId) === String(a._id)).length - categoryRows.filter((category) => String(category.parentId) === String(b._id)).length
                : undefined,
              render: (item) => {
                if (!isParentCategoryView) return item.isParent ? "—" : (item.parentName || "—");
                const count = categoryRows.filter((category) => String(category.parentId) === String(item._id)).length;
                return (
                  <button
                    type="button"
                    className="category-count-action"
                    title={`View ${count} ${count === 1 ? "category" : "categories"} under ${item.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      setViewedParentCategory(item);
                    }}
                  >
                    <span className={`category-count-badge ${count ? "has-items" : "empty"}`}>
                      <b>{count}</b> <small>{count === 1 ? "category" : "categories"}</small>
                    </span>
                  </button>
                );
              },
            },
          ]
        : []),
      {
        key: "count",
        label: "Products",
        sortable: true,
        sortFn: (a, b) =>
          (a.productCount ?? a.count ?? 0) - (b.productCount ?? b.count ?? 0),
        render: (item) => {
          const count = item.productCount ?? item.count ?? 0;
          const canNavigateToProducts = Boolean(onNavigate && count > 0 && (!item.isParent || isParentCategoryView));
          const badge = (
            <span className={`category-count-badge ${count > 0 ? "has-items" : "empty"}`}>
              <b>{count}</b> <small>{count === 1 ? "item" : "items"}</small>
            </span>
          );
          return canNavigateToProducts ? (
            <button
              type="button"
              className="category-count-action"
              title={`View ${count} product${count > 1 ? "s" : ""} for ${item.name}`}
              onClick={(event) => {
                event.stopPropagation();
                if (item.isParent) {
                  onNavigate("Products", {
                    parentCategoryId: String(item._id),
                    parentCategoryName: item.name,
                  });
                } else {
                  onNavigate("Products", item.name);
                }
              }}
            >
              {badge}
            </button>
          ) : badge;
        },
      },
      {
        key: "isActive",
        label: "Status",
        sortable: true,
        render: (item) => (
          <span className={`status ${item.isActive === false ? "paused" : ""}`}>
            {item.isActive === false ? "Hidden" : "Active"}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        align: "right",
        render: (item) => (
          <RowActionsMenu
            onEdit={() => onEdit(item)}
            onDelete={() => onDelete(item)}
            extraActions={isParentCategoryView ? [{ label: "View", icon: Eye, onClick: () => setViewedParentCategory(item) }] : []}
            editLabel="Edit"
            deleteLabel="Delete"
          />
        ),
      },
    ],
    [kind, isCategory, isParentCategoryView, categoryRows, onEdit, onDelete, onNavigate],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        pageSize={initialPageSize}
        emptyMessage={`No ${kind.toLowerCase()} found.`}
      />
      <Modal
        isOpen={Boolean(viewedParentCategory)}
        onClose={() => setViewedParentCategory(null)}
        title={viewedParentCategory?.name || "Parent category details"}
        subtitle="Parent category information and all categories grouped under it."
        showFooter={false}
        maxWidth="780px"
        className="category-details-modal"
      >
        {viewedParentCategory && (
          <div className="category-details-content">
            <div className="category-details-overview">
              <div><span>URL slug</span><strong>/{viewedParentCategory.slug || "—"}</strong></div>
              <div><span>Status</span><strong>{viewedParentCategory.isActive === false ? "Inactive" : "Active"}</strong></div>
              <div><span>Categories</span><strong>{viewedSubcategories.length}</strong></div>
              <div><span>Products</span><strong>{viewedProductCount}</strong></div>
              <div><span>Created</span><strong>{viewedParentCategory.createdAt ? dateLabel(viewedParentCategory.createdAt) : "—"}</strong></div>
              <div><span>Last updated</span><strong>{viewedParentCategory.updatedAt ? dateLabel(viewedParentCategory.updatedAt) : "—"}</strong></div>
            </div>

            <section className="category-details-list" aria-label="Categories in this parent category">
              <div className="category-details-list-heading">
                <div><span>Grouped categories</span><h3>Categories under {viewedParentCategory.name}</h3></div>
                <span className="category-details-total">{viewedSubcategories.length} total</span>
              </div>
              {viewedSubcategories.length ? viewedSubcategories.map((category) => (
                <article className="category-detail-row" key={category._id}>
                  <div className="category-detail-main">
                    <strong>{category.name}</strong>
                    <span>/{category.slug}</span>
                    {category.description && <small>{category.description}</small>}
                  </div>
                  <span className="category-detail-type">{category.type === "concern" ? "Health concern" : "Product form"}</span>
                  <span className={`category-detail-status${category.isActive === false ? " inactive" : ""}`}>
                    {category.isActive === false ? "Inactive" : "Active"}
                  </span>
                  <span className="category-detail-products">{category.productCount || 0} products</span>
                </article>
              )) : (
                <div className="category-details-empty">No categories have been assigned to this parent yet.</div>
              )}
            </section>
          </div>
        )}
      </Modal>
    </>
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
          status: status || (isApproved ? "approved" : "rejected"),
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
            className={`status ${review.isApproved ? "" : review.status === "rejected" ? "paused" : "processing"}`}
          >
            {review.isApproved
              ? "Approved"
              : review.status === "rejected"
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
                      onClick: () => action(review, false, "rejected"),
                    },
                  ]
                : [
                    {
                      label: "Approve (Publish to store)",
                      icon: CheckCircle2,
                      onClick: () => action(review, true, "approved"),
                    },
                    ...(review.status !== "rejected"
                      ? [
                          {
                            label: "Reject review",
                            icon: EyeOff,
                            onClick: () => action(review, false, "rejected"),
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

export function CustomerTable({ rows = [], pageSize: initialPageSize = 10 }) {
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
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      pageSize={initialPageSize}
      emptyMessage="Customer records appear after an order is placed."
    />
  );
}

export function BlogTable({
  rows = [],
  onEdit,
  onDelete,
  pageSize: initialPageSize = 10,
}) {
  const columns = useMemo(
    () => [
      {
        key: "title",
        label: "Title",
        sortable: true,
        render: (blog) => (
          <div>
            <b>{blog.title}</b>
            <small className="cell-subtitle">{blog.excerpt}</small>
          </div>
        ),
      },
      {
        key: "slug",
        label: "Slug",
        cellClassName: "muted",
        sortable: true,
      },
      {
        key: "category",
        label: "Category",
        sortable: true,
        render: (blog) => blog.category || blog.tags?.[0] || "—",
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        render: (blog) => (
          <span
            className={`status ${blog.status === "published" ? "" : "processing"}`}
          >
            {blog.status}
          </span>
        ),
      },
      {
        key: "viewsCount",
        label: "Views",
        sortable: true,
        render: (blog) => blog.viewsCount || 0,
      },
      {
        key: "publishedAt",
        label: "Published",
        sortable: true,
        render: (blog) => dateLabel(blog.publishedAt),
      },
      ...(onEdit || onDelete
        ? [
            {
              key: "actions",
              label: "Actions",
              align: "right",
              render: (blog) => (
                <RowActionsMenu
                  onEdit={onEdit ? () => onEdit(blog) : undefined}
                  onDelete={onDelete ? () => onDelete(blog) : undefined}
                  editLabel="Edit"
                  deleteLabel="Delete"
                />
              ),
            },
          ]
        : []),
    ],
    [onEdit, onDelete],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      pageSize={initialPageSize}
      emptyMessage="No blog posts found. Blog publishing needs an administrator author record in the database."
    />
  );
}

export function UserTable({ rows = [], pageSize: initialPageSize = 10, onEdit, onDelete }) {
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
        render: (person) => (
          <RowActionsMenu
            onEdit={onEdit ? () => onEdit(person) : undefined}
            onDelete={onDelete ? () => onDelete(person) : undefined}
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
      emptyMessage="No admin or employee accounts found."
    />
  );
}
