import { PaymentDetailSectionTitle } from "./PaymentDetailSectionTitle";
import { formatOrderAddress } from "./payment-utils";

const addressText = (address) => formatOrderAddress(address, "Address not available");

/**
 * "Customer" section of the payment details dialog: contact, delivery and billing address.
 * @param {{payment: object, order: object, customer: object, shipping: object, customerName: string}} props
 */
export function PaymentCustomerSection({ payment, order, customer, shipping, customerName }) {
  return (
    <section className="payment-detail-section">
      <PaymentDetailSectionTitle index="01" title="Customer" description="Contact and delivery information" />
      <div className="payment-detail-facts">
        <article><span>Name</span><strong>{customerName}</strong></article>
        <article><span>Email</span><strong>{customer.email || payment.customer?.email || "—"}</strong></article>
        <article><span>Phone</span><strong>{shipping?.phone || customer.phone || "—"}</strong></article>
        <article className="wide"><span>Delivery address</span><strong>{shipping.fullName || customerName}</strong><small>{addressText(shipping)}</small></article>
        {order.billingAddress && <article className="wide"><span>Billing address</span><strong>{order.billingAddress.fullName || customerName}</strong><small>{addressText(order.billingAddress)}</small></article>}
      </div>
    </section>
  );
}
