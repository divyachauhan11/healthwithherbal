"use client";

import { useMemo } from "react";
import { DataTable } from "./DataTable";
import { RowActionsMenu } from "./AdminTables";

export function BrandTable({ rows = [], onEdit, onDelete, onNavigate, pageSize = 10 }) {
  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Brand",
        sortable: true,
        render: (brand) => (
          <div className="product-cell">
            {brand.image || brand.logoUrl || brand.images?.[0] ? (
              <div className="product-thumb">
                <img
                  src={brand.image || brand.logoUrl || brand.images[0]}
                  alt={brand.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "6px" }}
                />
              </div>
            ) : (
              <div className="product-thumb">{brand.name?.slice(0, 1)}</div>
            )}
            <div>
              <b>{brand.name}</b>
              {brand.images?.length > 1 && (
                <small className="cell-subtitle" style={{ color: "#347055", fontWeight: 600 }}>
                  +{brand.images.length - 1} photo{brand.images.length > 2 ? "s" : ""}
                </small>
              )}
            </div>
          </div>
        ),
      },
      { key: "slug", label: "Slug", sortable: true, cellClassName: "muted" },
      {
        key: "count",
        label: "Products",
        sortable: true,
        sortFn: (a, b) =>
          (a.productCount ?? a.count ?? 0) - (b.productCount ?? b.count ?? 0),
        render: (brand) => {
          const count = brand.productCount ?? brand.count ?? 0;
          const badge = (
            <span className={`category-count-badge ${count > 0 ? "has-items" : "empty"}`}>
              <b>{count}</b> <small>{count === 1 ? "item" : "items"}</small>
            </span>
          );
          if (!onNavigate || count <= 0) return badge;
          return (
            <button
              type="button"
              className="category-count-action"
              title={`View ${count} products for ${brand.name}`}
              onClick={(event) => {
                event.stopPropagation();
                onNavigate("Products", brand.name);
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
        render: (brand) => (
          <span className={`status ${brand.isActive === false ? "paused" : ""}`}>
            {brand.isActive === false ? "Hidden" : "Active"}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        align: "right",
        render: (brand) => (
          <RowActionsMenu
            onEdit={() => onEdit(brand)}
            onDelete={() => onDelete(brand)}
            editLabel="Edit"
            deleteLabel="Delete"
          />
        ),
      },
    ],
    [onEdit, onDelete, onNavigate],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      pageSize={pageSize}
      emptyMessage="No brands found."
    />
  );
}
