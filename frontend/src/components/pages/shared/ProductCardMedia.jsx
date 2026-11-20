"use client";
import { ShoppingBag, Heart } from "lucide-react";
import { ProductCardBadges } from "./ProductCardBadges";
import { parseProductBadges } from "./product-utils";

/**
 * Image area of a product card: badges, wishlist toggle, product image (or a
 * placeholder) and the out-of-stock label.
 * @param {object} props
 * @param {object} props.product
 * @param {boolean} props.wished
 * @param {boolean} props.isOutOfStock
 * @param {() => void} props.onWish
 * @param {() => void} props.onOpen Opens the product page.
 */
export function ProductCardMedia({ product, wished, isOutOfStock, onWish, onOpen }) {
  const badges = parseProductBadges(product.badge);

  return (
    <div className="product-image-wrap">
      {badges.length > 0 && <ProductCardBadges badges={badges} />}
      <button
        type="button"
        className={`wish-button ${wished ? "active" : ""}`}
        onClick={onWish}
        aria-label="Toggle wishlist"
      >
        <Heart size={18} fill={wished ? "currentColor" : "none"} />
      </button>
      <button type="button" className="image-button" onClick={onOpen}>
        {product.image ? (
          <img src={product.image} alt={product.title} />
        ) : (
          <span className="product-image-placeholder" aria-hidden="true" />
        )}
      </button>
      {isOutOfStock && (
        <span className="out-of-stock-label">
          <ShoppingBag size={15} /> Out of stock
        </span>
      )}
    </div>
  );
}
