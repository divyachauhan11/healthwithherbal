"use client";

import { useEffect, useRef } from "react";
import {
  Trash2,
  AlertTriangle,
  X,
  Loader2,
  Package,
  Layers,
  Tag,
  Star,
  FileText,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { currency } from "./admin-utils";

/**
 * Format human-readable singular name from kind string
 */
function getKindSingular(kind = "") {
  const map = {
    products: "Product",
    categories: "Category",
    brands: "Brand",
    coupons: "Coupon",
    reviews: "Review",
    blogs: "Blog Post",
    users: "User",
    customers: "Customer",
  };
  if (map[kind]) return map[kind];
  if (kind.endsWith("ies")) return kind.slice(0, -3) + "y";
  if (kind.endsWith("s")) return kind.slice(0, -1);
  return kind ? kind.charAt(0).toUpperCase() + kind.slice(1) : "Record";
}

/**
 * Extract display data from any entity
 */
function getItemDetails(item, kind) {
  if (!item) return { title: "Selected Item", subtitle: "", image: null };

  let title = item.title || item.name || item.code || "Unnamed Record";
  let subtitle = "";
  let image = null;
  let badges = [];

  // Thumbnail extraction
  if (item.images && item.images.length > 0) {
    const firstImg = item.images[0];
    image = typeof firstImg === "string" ? firstImg : firstImg?.url;
  } else if (item.image) {
    image = typeof item.image === "string" ? item.image : item.image?.url;
  } else if (item.logo) {
    image = item.logo;
  } else if (item.thumbnail) {
    image = item.thumbnail;
  }

  // Kind-specific enrichments
  if (kind === "products") {
    if (item.sku) badges.push(`SKU: ${item.sku}`);
    if (item.price != null) badges.push(currency(item.price));
    if (item.category) badges.push(item.category);
    if (item.stock != null) badges.push(`${item.stock} in stock`);
  } else if (kind === "categories" || kind === "brands") {
    if (item.slug) badges.push(`/${item.slug}`);
    const count = item.productCount ?? item.count ?? 0;
    badges.push(`${count} product${count === 1 ? "" : "s"}`);
  } else if (kind === "coupons") {
    title = `Coupon: ${item.code || title}`;
    if (item.discountPercent) badges.push(`${item.discountPercent}% OFF`);
    else if (item.discount) badges.push(`${item.discount}% OFF`);
    if (item.minSpend) badges.push(`Min: ${currency(item.minSpend)}`);
  } else if (kind === "reviews") {
    title = item.productId?.title
      ? `Review for "${item.productId.title}"`
      : item.title || "Customer Review";
    const author = item.userId?.name || item.name || "Verified Customer";
    subtitle = `By ${author}`;
    if (item.rating) badges.push(`${item.rating} ★`);
    if (item.comment) {
      subtitle += ` — "${item.comment.slice(0, 50)}${item.comment.length > 50 ? "…" : ""}"`;
    }
  } else if (kind === "blogs") {
    if (item.slug) badges.push(`/${item.slug}`);
    if (item.status) badges.push(item.status);
    if (item.viewsCount != null) badges.push(`${item.viewsCount} views`);
  }

  return { title, subtitle, image, badges };
}

/**
 * Kind icon component fallback when no image exists
 */
function KindIcon({ kind }) {
  switch (kind) {
    case "products":
      return <Package size={22} />;
    case "categories":
      return <Layers size={22} />;
    case "brands":
    case "coupons":
      return <Tag size={22} />;
    case "reviews":
      return <Star size={22} />;
    case "blogs":
      return <FileText size={22} />;
    default:
      return <AlertCircle size={22} />;
  }
}

/**
 * Global Delete Confirmation Modal Popup Screen for Admin Portal
 */
export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  item,
  kind,
  isBlocked = false,
  blockedCount = 0,
  onNavigateToAssigned,
  busy = false,
}) {
  const modalCardRef = useRef(null);
  const confirmBtnRef = useRef(null);

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Auto-focus confirm button
    const timer = setTimeout(() => {
      confirmBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !busy) {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose, busy]);

  if (!isOpen || !item) return null;

  const kindSingular = getKindSingular(kind);
  const { title, subtitle, image, badges } = getItemDetails(item, kind);

  return (
    <div
      className="admin-delete-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) {
          onClose?.();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div
        className={`admin-delete-modal-card ${isBlocked ? "is-blocked" : "is-danger"}`}
        ref={modalCardRef}
      >
        {/* Top accent badge */}
        <div className="admin-delete-modal-top">
          <div
            className={`admin-delete-modal-icon-badge ${
              isBlocked ? "badge-blocked" : "badge-danger"
            }`}
          >
            {isBlocked ? (
              <ShieldAlert size={28} />
            ) : (
              <Trash2 size={26} />
            )}
          </div>

          <button
            type="button"
            className="admin-delete-modal-close"
            onClick={onClose}
            disabled={busy}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Header content */}
        <div className="admin-delete-modal-body">
          <h2 id="delete-modal-title" className="admin-delete-modal-title">
            {isBlocked
              ? `Cannot Delete ${kindSingular}`
              : `Delete ${kindSingular}?`}
          </h2>

          <p className="admin-delete-modal-desc">
            {isBlocked ? (
              <>
                This {kindSingular.toLowerCase()} cannot be deleted because it is
                actively assigned to store products. Please reassign or delete
                the linked products first.
              </>
            ) : (
              <>
                Are you sure you want to permanently delete this{" "}
                <strong>{kindSingular.toLowerCase()}</strong>? This action is
                irreversible{kind === "users"
                  ? " and will remove this user's admin portal account."
                  : " and will remove all related data from your live catalog."}
              </>
            )}
          </p>

          {/* Item Preview Card */}
          <div className="admin-delete-preview-box">
            <div className="admin-delete-preview-thumb">
              {image ? (
                <img
                  src={image}
                  alt={title}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    if (e.currentTarget.nextElementSibling) {
                      e.currentTarget.nextElementSibling.style.display = "flex";
                    }
                  }}
                />
              ) : null}
              <div
                className="admin-delete-preview-icon-fallback"
                style={{ display: image ? "none" : "flex" }}
              >
                <KindIcon kind={kind} />
              </div>
            </div>

            <div className="admin-delete-preview-content">
              <span className="admin-delete-preview-type">
                {kindSingular}
              </span>
              <h4 className="admin-delete-preview-title" title={title}>
                {title}
              </h4>
              {subtitle && (
                <p className="admin-delete-preview-sub">{subtitle}</p>
              )}

              {badges.length > 0 && (
                <div className="admin-delete-preview-badges">
                  {badges.map((b, i) => (
                    <span key={i} className="admin-delete-pill">
                      {b}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Context Notice / Warning */}
          {isBlocked ? (
            <div className="admin-delete-warning-box blocked">
              <AlertTriangle size={18} className="warning-icon" />
              <div>
                <strong>Active Dependency Detected</strong>
                <p>
                  Found <b>{blockedCount}</b> active product
                  {blockedCount === 1 ? "" : "s"} linked to this{" "}
                  {kindSingular.toLowerCase()}. Deleting it would leave orphaned
                  records on your live customer storefront.
                </p>
              </div>
            </div>
          ) : (
            <div className="admin-delete-warning-box danger">
              <AlertCircle size={18} className="warning-icon" />
              <div>
                <strong>Permanent Removal Notice</strong>
                <p>
                  Once confirmed, this record will be purged from the database
                  immediately. Customer orders referencing this product will retain
                  their historical order records.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="admin-delete-modal-footer">
          {isBlocked ? (
            <>
              <button
                type="button"
                className="admin-delete-btn secondary"
                onClick={onClose}
                disabled={busy}
              >
                Close
              </button>
              {onNavigateToAssigned && (
                <button
                  type="button"
                  className="admin-delete-btn primary-action"
                  onClick={() => {
                    onClose();
                    onNavigateToAssigned(item.name || item.title);
                  }}
                >
                  View Assigned Products ({blockedCount}) <ArrowRight size={15} />
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                className="admin-delete-btn secondary"
                onClick={onClose}
                disabled={busy}
              >
                Cancel, keep {kindSingular.toLowerCase()}
              </button>
              <button
                type="button"
                ref={confirmBtnRef}
                className="admin-delete-btn danger-action"
                onClick={onConfirm}
                disabled={busy}
              >
                {busy ? (
                  <>
                    <Loader2 size={16} className="spin-animate" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    Yes, delete permanently
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;
