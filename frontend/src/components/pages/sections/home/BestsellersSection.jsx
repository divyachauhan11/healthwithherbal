"use client";
import { SectionHeading } from "@/components/pages/shared/primitives";
import { ProductGrid } from "@/components/pages/shared/ProductGrid";
import { ViewAllButton } from "./ViewAllButton";

const bestsellerKey = (product) => product.id || product._id;

/**
 * "Our bestsellers" section with a "View all" link.
 * @param {object} props
 * @param {Array<object>} props.products Bestselling products to show.
 * @param {Array<string|number>} props.wished
 * @param {Array<string|number>} props.cart
 * @param {(id: string|number) => void} props.onWish
 * @param {(id: string|number) => void} props.onAdd
 * @param {(id: string|number) => void} props.openProduct
 * @param {(view: string) => void} props.openCatalog
 */
export function BestsellersSection({
  products,
  wished,
  cart,
  onWish,
  onAdd,
  openProduct,
  openCatalog,
}) {
  return (
    <section className="section soft-section">
      <div className="page-width">
        <div className="section-row">
          <SectionHeading
            eyebrow="Chosen for you"
            title="Our bestsellers"
            copy="Discover our most loved products"
          />
          <ViewAllButton onClick={() => openCatalog("All Products")} />
        </div>
        <ProductGrid
          products={products}
          getKey={bestsellerKey}
          wished={wished}
          cart={cart}
          onWish={onWish}
          onAdd={onAdd}
          openProduct={openProduct}
          openCatalog={openCatalog}
        />
      </div>
    </section>
  );
}
