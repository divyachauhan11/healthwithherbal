"use client";
import { Check, ShoppingBag } from "lucide-react";
import { Rating } from "./Rating";

/**
 * Text area of a product card: brand, rating, title, category, price and the
 * quick-add button (or "View similar" when out of stock).
 * @param {object} props
 * @param {object} props.product
 * @param {boolean} props.added Whether the product is already in the bag.
 * @param {boolean} props.isOutOfStock
 * @param {() => void} props.onOpen Opens the product page.
 * @param {() => void} props.onAdd
 * @param {() => void} props.onSimilar Shows similar products.
 */
export function ProductCardDetails({ product, added, isOutOfStock, onOpen, onAdd, onSimilar }) {
  return (
    <div className="product-copy">
      <div className="product-meta">
        <span>{product.brand}</span>
        <Rating value={product.rating} reviews={product.reviews} />
      </div>
      <button type="button" className="product-title" onClick={onOpen}>
        {product.title}
      </button>
      <span className="product-category">{product.category}</span>
      <div className="product-bottom">
        <div className="price">
          <strong>₹{product.price.toFixed(2)}</strong>
          <del>₹{product.original.toFixed(2)}</del>
        </div>
        {isOutOfStock ? (
          <button
            type="button"
            className="view-similar-button"
            onClick={onSimilar}
          >
            View similar
          </button>
        ) : (
          <button
            type="button"
            className={`quick-add ${added ? "added" : ""}`}
            onClick={onAdd}
            aria-label={added ? "Already in bag" : "Add to bag"}
          >
            {added ? <Check size={16} /> : <ShoppingBag size={17} />}
            {added && <span>In bag</span>}
          </button>
        )}
      </div>
    </div>
  );
}
