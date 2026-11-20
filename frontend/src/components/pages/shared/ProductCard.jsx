"use client";
import { ProductCardDetails } from "./ProductCardDetails";
import { ProductCardMedia } from "./ProductCardMedia";
import { isProductOutOfStock } from "./product-utils";

/**
 * Storefront product card.
 * @param {object} props
 * @param {object} props.product
 * @param {boolean} props.wished Whether the product is in the wishlist.
 * @param {boolean} props.added Whether the product is in the bag.
 * @param {() => void} props.onWish
 * @param {() => void} props.onAdd
 * @param {() => void} props.onOpen Opens the product page.
 * @param {() => void} props.onSimilar Shows similar products (out-of-stock cards).
 */
export function ProductCard({
  product,
  wished,
  added,
  onWish,
  onAdd,
  onOpen,
  onSimilar,
}) {
  const isOutOfStock = isProductOutOfStock(product);

  return (
    <article
      className={`product-card${isOutOfStock ? " is-out-of-stock" : ""}`}
    >
      <ProductCardMedia
        product={product}
        wished={wished}
        isOutOfStock={isOutOfStock}
        onWish={onWish}
        onOpen={onOpen}
      />
      <ProductCardDetails
        product={product}
        added={added}
        isOutOfStock={isOutOfStock}
        onOpen={onOpen}
        onAdd={onAdd}
        onSimilar={onSimilar}
      />
    </article>
  );
}
