import { CalendarDays, ClipboardList, Package, UserRound } from "lucide-react";
import { RETURN_EXCHANGE_TYPES } from "@/constants/statuses";
import { currencyFixed, dateLabel } from "@/components/admin/global/admin-utils";
import { getRequestCustomerName, getRequestUnitPrice } from "./returns-utils";

/**
 * Summary cards of a request: submission date, customer, requested item and type.
 * @param {{request: object}} props
 */
export function ReturnReviewSummary({ request }) {
  const customerName = getRequestCustomerName(request);
  const itemName = request.item?.title || "Product";
  const unitPrice = getRequestUnitPrice(request);

  return (
    <section className="return-review-summary">
      <article><span><CalendarDays size={14} /> Submitted</span><strong>{dateLabel(request.createdAt)}</strong></article>
      <article><span><UserRound size={14} /> Customer</span><strong>{customerName}</strong><small>{request.customer?.email || "Email not provided"}</small></article>
      <article><span><Package size={14} /> Requested item</span><strong>{itemName}</strong><small>{request.quantity || 1} × {currencyFixed(unitPrice)}</small></article>
      <article><span><ClipboardList size={14} /> Request type</span><strong className="return-review-type">{request.type || RETURN_EXCHANGE_TYPES[0]}</strong><small>Order #{request.orderNumber}</small></article>
    </section>
  );
}
