"use client";

import { useMemo, useState } from "react";
import { Eye, HeartPulse, Pill } from "lucide-react";
import { Modal } from "../global/Modal";
import { dateLabel } from "../global/admin-utils";
import { DataTable } from "./DataTable";
import { RowActionsMenu } from "./AdminTables";

export function CategoryTable({
  rows = [],
  categoryView = "categories",
  categoryRows = rows,
  onEdit,
  onDelete,
  onNavigate,
  pageSize = 10,
}) {
  const [viewedParentCategory, setViewedParentCategory] = useState(null);
  const isParentCategoryView = categoryView === "parents";
  const viewedSubcategories = viewedParentCategory
    ? categoryRows.filter(
        (category) => String(category.parentId) === String(viewedParentCategory._id),
      )
    : [];
  const viewedProductCount = viewedSubcategories.reduce(
    (total, category) => total + Number(category.productCount || 0),
    0,
  );

  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Category",
        sortable: true,
        render: (item) => (
          <div className="product-cell">
            {(item.image || item.images?.[0]) && (
              <div className="product-thumb">
                <img
                  src={item.image || item.images[0]}
                  alt={item.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "6px" }}
                />
              </div>
            )}
            <div>
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
              {item.images?.length > 1 && (
                <small className="cell-subtitle" style={{ color: "#347055", fontWeight: 600 }}>
                  +{item.images.length - 1} photo{item.images.length > 2 ? "s" : ""}
                </small>
              )}
            </div>
          </div>
        ),
      },
      { key: "slug", label: "Slug", cellClassName: "muted", sortable: true },
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
          ? (a, b) =>
              categoryRows.filter((category) => String(category.parentId) === String(a._id)).length -
              categoryRows.filter((category) => String(category.parentId) === String(b._id)).length
          : undefined,
        render: (item) => {
          if (!isParentCategoryView) return item.isParent ? "—" : item.parentName || "—";
          const count = categoryRows.filter(
            (category) => String(category.parentId) === String(item._id),
          ).length;
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
      {
        key: "count",
        label: "Products",
        sortable: true,
        sortFn: (a, b) =>
          (a.productCount ?? a.count ?? 0) - (b.productCount ?? b.count ?? 0),
        render: (item) => {
          const count = item.productCount ?? item.count ?? 0;
          const canNavigate = Boolean(onNavigate && count > 0 && (!item.isParent || isParentCategoryView));
          const badge = (
            <span className={`category-count-badge ${count > 0 ? "has-items" : "empty"}`}>
              <b>{count}</b> <small>{count === 1 ? "item" : "items"}</small>
            </span>
          );
          if (!canNavigate) return badge;

          return (
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
          );
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
            extraActions={isParentCategoryView
              ? [{ label: "View", icon: Eye, onClick: () => setViewedParentCategory(item) }]
              : []}
            editLabel="Edit"
            deleteLabel="Delete"
          />
        ),
      },
    ],
    [isParentCategoryView, categoryRows, onEdit, onDelete, onNavigate],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        pageSize={pageSize}
        emptyMessage={isParentCategoryView ? "No parent categories found." : "No categories found."}
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
