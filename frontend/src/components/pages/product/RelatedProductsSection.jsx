"use client";
import { ProductCard, SectionHeading } from "@/components/pages/shared/primitives";

/**
 * "You may also like" grid. Opening a related product scrolls back to the top.
 * @param {object} props
 * @param {object} props.product The product being viewed.
 * @param {Array<object>} props.products Related products.
 * @param {Array<string|number>} props.wished
 * @param {Array<string|number>} props.cart
 * @param {(id: string|number) => void} props.onWish
 * @param {(id: string|number) => void} props.onAdd
 * @param {(id: string|number) => void} props.openProduct
 * @param {(view: string) => void} [props.openCatalog]
 */
export function RelatedProductsSection({
  product,
  products,
  wished,
  cart,
  onWish,
  onAdd,
  openProduct,
  openCatalog,
}) {
  return (
    <section className="related-products-section">
      <div className="related-products-header">
        <SectionHeading
          eyebrow="Complete your ritual"
          title="You may also like"
          copy="Carefully paired botanical remedies tailored to your wellness needs."
        />
      </div>

      <div className="products-grid related-products-grid">
        {products.map((relProduct) => (
          <ProductCard
            key={relProduct.id}
            product={relProduct}
            wished={wished.includes(relProduct.id)}
            added={cart.includes(relProduct.id)}
            onWish={() => onWish(relProduct.id)}
            onAdd={() => onAdd(relProduct.id)}
            onSimilar={() => openCatalog?.(relProduct.category || product.category || "All Products")}
            onOpen={() => {
              openProduct(relProduct.id);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        ))}
      </div>
    </section>
  );
}
