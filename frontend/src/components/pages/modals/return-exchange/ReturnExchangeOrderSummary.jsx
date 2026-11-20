import { currency, dateLabel } from "@/components/admin/global/admin-utils";

/**
 * Order date and total shown above the return/exchange form.
 * @param {object} props
 * @param {object} props.order Order the request is about.
 */
export function ReturnExchangeOrderSummary({ order }) {
  return (
    <div className="return-exchange-order-summary">
      <span>Order date · {dateLabel(order.createdAt)}</span>
      <strong>{currency(order.total, order.currency || "INR")}</strong>
    </div>
  );
}
