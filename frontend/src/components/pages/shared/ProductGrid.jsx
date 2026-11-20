"use client";
import { ProductCard } from "./ProductCard";

const productIdOf = (product) => product.id;

/**
 * `.products-grid` of product cards wired to the bag and the wishlist.
 * @param {object} props
 * @param {Array<object>} props.products Products to show, in order.
 * @param {string} [props.className] Extra grid class, e.g. "shop-products".
 * @param {(product: object) => string|number} [props.getId] ID used for bag/wishlist actions (default `product.id`).
 * @param {(product: object) => React.Key} [props.getKey] React key (default: `getId`).
 * @param {Array<string|number>} props.wished Wishlist product IDs.
 * @param {Array<string|number>} props.cart Bag product IDs.
 * @param {(id: string|number) => void} props.onWish
 * @param {(id: string|number) => void} props.onAdd
 * @param {(id: string|number) => void} props.openProduct
 * @param {(view: string) => void} props.openCatalog Opens the product's category ("View similar").
 * @param {React.ReactNode} [props.children] Rendered after the cards (e.g. an empty state).
 */
export function ProductGrid({
  products,
  className,
  getId = productIdOf,
  getKey = getId,
  wished,
  cart,
  onWish,
  onAdd,
  openProduct,
  openCatalog,
  children,
}) {
  return (
    <div className={className ? `products-grid ${className}` : "products-grid"}>
      {products.map((product) => (
        <ProductCard
          key={getKey(product)}
          product={product}
          wished={wished.includes(getId(product))}
          added={cart.includes(getId(product))}
          onWish={() => onWish(getId(product))}
          onAdd={() => onAdd(getId(product))}
          onOpen={() => openProduct(getId(product))}
          onSimilar={() => openCatalog?.(product.category || "All Products")}
        />
      ))}
      {children}
    </div>
  );
}
