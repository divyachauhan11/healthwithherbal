import { getStockLevel } from "./inventory-alert-utils";

/**
 * One low stock product: thumbnail, title, category and remaining stock.
 * @param {{product: Object}} props
 */
export function InventoryAlertRow({ product }) {
  const { quantity, threshold, out, remaining } = getStockLevel(product);
  return <div className="stock-row">
    <div className="product-thumb">{product.image ? <img src={product.image} alt={product.title} /> : product.title?.slice(0, 1)}</div>
    <div><b>{product.title}</b><span>{product.category}</span></div>
    <div className="stock-level"><strong className={out ? "out" : ""}>{out ? "Out" : `${quantity} left`}</strong><span>{out ? "0% remaining" : `${remaining}% of threshold (${threshold})`}</span></div>
  </div>;
}
