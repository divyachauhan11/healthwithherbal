import { Package, ShoppingBag } from "lucide-react";
import { CustomerDetailsState } from "./CustomerDetailsState";
import { CustomerOrderCard } from "./CustomerOrderCard";
import { CustomerSectionHeading } from "./CustomerSectionHeading";

/**
 * "Orders & payments" section of the customer details dialog.
 * @param {{orders: Array<object>}} props
 */
export function CustomerOrdersSection({ orders }) {
  return (
    <section className="customer-orders-section">
      <CustomerSectionHeading icon={ShoppingBag} title="Orders & payments" count={orders.length} countLabel={orders.length === 1 ? "order" : "orders"} />
      {orders.length ? (
        <div className="customer-orders-list">
          {orders.map((order) => (
            <CustomerOrderCard key={order._id} order={order} />
          ))}
        </div>
      ) : (
        <CustomerDetailsState><Package size={20} /> This customer has no orders yet.</CustomerDetailsState>
      )}
    </section>
  );
}
