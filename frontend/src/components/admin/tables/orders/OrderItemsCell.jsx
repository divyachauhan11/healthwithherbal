import { summarizeOrderItems } from "./order-utils";

/**
 * First ordered item with its quantity, plus "+N more" for the rest.
 * @param {{items?: Array<Object>|Object}} props
 */
export function OrderItemsCell({ items = [] }) {
  if (!items || !items.length) {
    return <span className="muted">—</span>;
  }

  const itemsList = Array.isArray(items) ? items : [items];
  const fullSummary = summarizeOrderItems(itemsList);

  return (
    <div className="order-items-cell" title={fullSummary}>
      <div className="order-items-list">
        <div className="order-item-chip">
          <span className="order-item-title">{itemsList[0].title || itemsList[0].name || "Product"}</span>
          <span className="order-item-qty">×{itemsList[0].quantity || 1}</span>
        </div>
        {itemsList.length > 1 && <span className="order-items-more">+{itemsList.length - 1} more</span>}
      </div>
    </div>
  );
}
