"use client";
import { ArrowRight, Heart } from "lucide-react";
import { AppButton, ProductCard } from "@/components/pages/shared/primitives";

/**
 * Saved products grid, or an empty state that links to the catalogue.
 * Both states share one component so the container element is updated in
 * place when the wishlist fills or empties.
 * @param {object} props
 * @param {Array<object>} props.items Wishlisted products.
 * @param {Array<string|number>} props.cart
 * @param {(id: string|number) => void} props.onWish
 * @param {(id: string|number) => void} props.onAdd
 * @param {(id: string|number) => void} props.openProduct
 * @param {(view: string) => void} [props.openCatalog]
 */
export function WishlistItems({ items, cart, onWish, onAdd, openProduct, openCatalog }) {
  return items.length === 0 ? (
    <div
      className="empty-state"
      style={{ textAlign: "center", padding: "60px 20px" }}
    >
      <Heart
        size={48}
        strokeWidth={1.5}
        style={{ margin: "0 auto 16px", opacity: 0.4 }}
      />
      <h3>Your wishlist is empty</h3>
      <p>
        Explore our Ayurvedic remedies and save your favourites for later.
      </p>
      <AppButton onClick={() => openCatalog?.("All Products")}>
        Explore Remedies <ArrowRight size={16} />
      </AppButton>
    </div>
  ) : (
    <div className="products-grid">
      {items.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          wished={true}
          added={cart.includes(product.id)}
          onWish={() => onWish(product.id)}
          onAdd={() => onAdd(product.id)}
          onOpen={() => openProduct(product.id)}
          onSimilar={() => openCatalog?.(product.category || "All Products")}
        />
      ))}
    </div>
  );
}
