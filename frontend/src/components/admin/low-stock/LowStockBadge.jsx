import { getStockBadge } from "./low-stock-utils";

/**
 * Stock level badge (OUT / CRITICAL / LOW) with the remaining quantity.
 * @param {{product: object}} props
 */
export function LowStockBadge({ product }) {
  const quantity = Number(product.stockQty ?? 0);
  const { severity, label } = getStockBadge(quantity);

  return (
    <span className={`low-stock-badge is-${severity}`}>
      {label} ({quantity}{quantity > 0 ? " left" : ""})
    </span>
  );
}
