import { formatReturnAddress, getOrderCustomerName } from "./returns-utils";

/**
 * Delivery and billing addresses of the order linked to a request.
 * @param {{request: object, order: object}} props
 */
export function ReturnReviewOrderAddresses({ request, order }) {
  const orderCustomer = getOrderCustomerName(order, request);

  return (
    <div className="return-review-order-addresses">
      <article><h4>Delivery address</h4><p>{order.shippingAddress?.fullName || orderCustomer}</p><p>{formatReturnAddress(order.shippingAddress || order.customer)}</p><p>{order.shippingAddress?.phone || order.customer?.phone || ""}</p></article>
      <article><h4>Billing address</h4><p>{formatReturnAddress(order.billingAddress || order.shippingAddress || order.customer)}</p></article>
    </div>
  );
}
