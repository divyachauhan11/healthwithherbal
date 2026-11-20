import { Package } from "lucide-react";
import { getOrderItemTotal } from "@/components/admin/payments/payment-utils";
import { formatOrderMoney } from "./returns-utils";

/**
 * One line item of the linked order; the item the request is about is highlighted.
 * @param {{item: object, order: object, isRequested: boolean}} props
 */
export function ReturnReviewOrderItem({ item, order, isRequested }) {
  return <article className={isRequested ? "return-review-requested-order-item" : ""}>
    {item.image ? <img src={item.image} alt="" /> : <span className="return-review-order-item-placeholder"><Package size={15} /></span>}
    <div><strong>{item.title || "Product"} {isRequested && <span className="return-review-requested-badge">Request item</span>}</strong><small>{item.brand || ""}{item.legacyId ? ` · SKU ${item.legacyId}` : ""}</small><small>{formatOrderMoney(item.unitPrice, order)} × {item.quantity || 1}</small></div>
    <b>{formatOrderMoney(getOrderItemTotal(item), order)}</b>
  </article>;
}
