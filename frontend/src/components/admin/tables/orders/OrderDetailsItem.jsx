import { ShoppingBag } from "lucide-react";
import { formatOrderAmount, getOrderItemTotal } from "./order-utils";

/**
 * One ordered product: image, title, brand/SKU, unit price × quantity and line total.
 * @param {{order: Object, item: Object}} props
 */
export function OrderDetailsItem({ order, item }) {
  return (
    <article className="order-detail-item">
      {item.image ? <img src={item.image} alt="" /> : <span className="order-detail-item-image"><ShoppingBag size={18} /></span>}
      <div><strong>{item.title || item.name || "Product"}</strong><small>{item.brand || ""}{item.legacyId ? ` · SKU ${item.legacyId}` : ""}</small><small>{formatOrderAmount(order, item.unitPrice)} × {item.quantity || 1}</small></div>
      <b>{formatOrderAmount(order, getOrderItemTotal(item))}</b>
    </article>
  );
}
