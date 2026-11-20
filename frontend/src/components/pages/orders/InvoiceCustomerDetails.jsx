import { InvoiceInfoCard } from "./InvoiceInfoCard";
import { joinAddress, joinName } from "./invoice-utils";

/**
 * "Customer details" card: name, email, phone, delivery and billing addresses.
 * @param {object} props
 * @param {object} props.order Invoiced order.
 */
export function InvoiceCustomerDetails({ order }) {
  const shipping = order.shippingAddress || order.customer || {};
  const billing = order.billingAddress || shipping;

  return (
    <InvoiceInfoCard title="Customer details">
      <dt>Name</dt><dd>{joinName(shipping) || joinName(billing) || order.customer?.name || "—"}</dd>
      <dt>Email</dt><dd>{shipping.email || order.customer?.email || "—"}</dd>
      <dt>Phone</dt><dd>{shipping.phone || order.customer?.phone || "—"}</dd>
      <dt>Delivery address</dt><dd>{joinAddress(shipping) || "—"}</dd>
      <dt>Billing address</dt><dd>{joinAddress(billing) || "Same as delivery address"}</dd>
    </InvoiceInfoCard>
  );
}
