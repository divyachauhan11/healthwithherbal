import { OrderDetailsItem } from "./OrderDetailsItem";

/**
 * Ordered products with the item count heading.
 * @param {{order: Object}} props
 */
export function OrderDetailsItems({ order }) {
  return (
    <section className="order-detail-items">
      <div className="order-detail-section-heading"><h3>Items</h3><span>{(order.items || []).length} {(order.items || []).length === 1 ? "product" : "products"}</span></div>
      {(order.items || []).map((item, index) => (
        <OrderDetailsItem key={`${item.product || item.legacyId || index}`} order={order} item={item} />
      ))}
    </section>
  );
}
