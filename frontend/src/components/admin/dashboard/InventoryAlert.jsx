"use client";

import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { Empty } from "../global/Empty";
import { DashboardPanel } from "./DashboardPanel";

export function InventoryAlert({ products = [], activeProductCount = 0, onViewAll }) {
  const lowStock = useMemo(() => products.filter((product) => Number(product.stockQty ?? 0) <= Number(product.lowStockThreshold ?? 10)), [products]);
  const visible = lowStock.slice(0, 7);
  const percentage = activeProductCount ? Math.round((lowStock.length / activeProductCount) * 100) : 0;

  return (
    <DashboardPanel title="Inventory alert" description={lowStock.length ? `${lowStock.length} items (${percentage}% of active catalog) need attention` : "All active products are healthy and well-stocked"} className="stock" action={<button type="button" className="text-button" onClick={onViewAll}>View all {lowStock.length ? `(${lowStock.length})` : ""}<ChevronRight size={15} /></button>}>
      <div className="stock-items-container">
        {visible.length ? visible.map((product) => {
          const quantity = Number(product.stockQty ?? 0);
          const threshold = Number(product.lowStockThreshold ?? 10);
          const out = quantity === 0;
          const remaining = out ? 0 : Math.min(100, Math.round((quantity / (threshold || 1)) * 100));
          return <div className="stock-row" key={product._id}>
            <div className="product-thumb">{product.image ? <img src={product.image} alt={product.title} /> : product.title?.slice(0, 1)}</div>
            <div><b>{product.title}</b><span>{product.category}</span></div>
            <div className="stock-level"><strong className={out ? "out" : ""}>{out ? "Out" : `${quantity} left`}</strong><span>{out ? "0% remaining" : `${remaining}% of threshold (${threshold})`}</span></div>
          </div>;
        }) : <Empty>All active products are above their stock threshold.</Empty>}
      </div>
      {lowStock.length > 7 && <div className="stock-footer"><span>Showing 7 of {lowStock.length} low stock products</span><button type="button" className="text-button" onClick={onViewAll}>View all products <ChevronRight size={13} /></button></div>}
    </DashboardPanel>
  );
}
