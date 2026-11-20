"use client";

/**
 * Product price, original price and saving.
 * @param {{product: {price: number, original: number}}} props
 */
export function ProductPrice({ product }) {
  return (
    <div className="detail-price">
      <strong>₹{product.price.toFixed(2)}</strong>
      <del>₹{product.original.toFixed(2)}</del>
      <span>Save ₹{(product.original - product.price).toFixed(2)}</span>
    </div>
  );
}
