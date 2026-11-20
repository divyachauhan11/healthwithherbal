import { discountPercentOff } from "./checkout-utils";

/**
 * Order summary product row: image, title, line price, seller, weight,
 * quantity and unit pricing with the MRP discount.
 * @param {object} props
 * @param {object} props.product Product.
 * @param {number} props.quantity Units ordered.
 */
export function CheckoutSummaryItem({ product, quantity }) {
  const unitPrice = Number(product.price) || 0;
  const originalPrice = Number(product.original) || 0;
  const discountPercent = discountPercentOff(originalPrice, unitPrice);

  return (
    <article className="summary-item">
      <img src={product.image} alt={product.title} />
      <div className="summary-item-details">
        <div className="summary-item-heading">
          <strong title={product.title}>{product.title}</strong>
          <b>₹{(unitPrice * quantity).toFixed(2)}</b>
        </div>
        <small className="summary-item-brand">
          Sold by: {product.brand || "Health With Herbal"}
        </small>
        <div className="summary-item-meta">
          {product.weightG > 0 && <span>{product.weightG} g</span>}
          <span>Qty: {quantity}</span>
        </div>
        <div className="summary-item-pricing">
          <strong>₹{unitPrice.toFixed(2)}</strong>
          {originalPrice > unitPrice && (
            <>
              <del>₹{originalPrice.toFixed(2)}</del>
              <span>{discountPercent}% OFF</span>
            </>
          )}
          {quantity > 1 && <small>each</small>}
        </div>
      </div>
    </article>
  );
}
