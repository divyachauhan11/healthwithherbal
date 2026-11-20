import { dateTimeLabel } from "../../global/admin-utils";
import { OrderDetailCard } from "./OrderDetailCard";
import { formatOrderAddress, getOrderCustomerName } from "./order-utils";

/**
 * Customer, delivery address, billing address (when present) and order
 * information cards.
 * @param {{order: Object}} props
 */
export function OrderDetailsCards({ order }) {
  const address = order.shippingAddress || order.customer || {};
  const billing = order.billingAddress || address;
  const customerName = getOrderCustomerName(order);

  return (
    <div className="order-detail-two-col">
      <OrderDetailCard title="Customer">
        <strong>{customerName}</strong>
        <p>{order.customer?.email || order.guestEmail || "No email provided"}</p>
        <p>{order.customer?.phone || order.phone || "No phone provided"}</p>
      </OrderDetailCard>
      <OrderDetailCard title="Delivery address">
        <p>{address.fullName || customerName}</p>
        <p>{formatOrderAddress(address)}</p>
        {(address.phone || address.mobile) && <p>{address.phone || address.mobile}</p>}
      </OrderDetailCard>
      {order.billingAddress && (
        <OrderDetailCard title="Billing address">
          <p>{formatOrderAddress(billing)}</p>
        </OrderDetailCard>
      )}
      <OrderDetailCard title="Order information">
        <p>Updated {dateTimeLabel(order.updatedAt)}</p>
        {order.orderNote && <p>Note: {order.orderNote}</p>}
        {order.couponCode && <p>Coupon: {order.couponCode}</p>}
      </OrderDetailCard>
    </div>
  );
}
