import { currency } from "@/components/admin/global/admin-utils";
import { getOrderItemTotal } from "./payment-utils";

/**
 * One order line in the payment details dialog (image or position number, title, price × quantity, total).
 * @param {{item: object, index: number, order: object}} props
 */
export function PaymentOrderItem({ item, index, order }) {
  return <article>
    {item.image ? <img src={item.image} alt="" /> : <span className="payment-detail-item-placeholder">{String(index + 1).padStart(2, "0")}</span>}
    <div><strong>{item.title || "Product"}</strong><small>{item.brand || ""}{item.legacyId ? ` · SKU ${item.legacyId}` : ""}</small><small>{currency(item.unitPrice, order.currency || "INR")} × {item.quantity || 1}</small></div>
    <b>{currency(getOrderItemTotal(item), order.currency || "INR")}</b>
  </article>;
}
