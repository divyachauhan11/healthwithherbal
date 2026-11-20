"use client";
import { SectionHeading } from "@/components/pages/shared/primitives";
import { ProductGrid } from "@/components/pages/shared/ProductGrid";
import { SHELF_TABS } from "./home-utils";

/**
 * "Fresh from the herbal shelf" section with Latest / Top rated / Featured tabs.
 * @param {object} props
 * @param {string} props.shelf Active tab.
 * @param {(tab: string) => void} props.onShelfChange
 * @param {Array<object>} props.products Products for the active tab.
 * @param {Array<string|number>} props.wished
 * @param {Array<string|number>} props.cart
 * @param {(id: string|number) => void} props.onWish
 * @param {(id: string|number) => void} props.onAdd
 * @param {(id: string|number) => void} props.openProduct
 * @param {(view: string) => void} props.openCatalog
 */
export function HerbalShelfSection({
  shelf,
  onShelfChange,
  products,
  wished,
  cart,
  onWish,
  onAdd,
  openProduct,
  openCatalog,
}) {
  return (
    <section className="section page-width">
      <div className="section-row">
        <SectionHeading
          eyebrow="Discover more"
          title="Fresh from the herbal shelf"
        />
        <div className="tabs">
          {SHELF_TABS.map((tab) => (
            <button
              type="button"
              className={shelf === tab ? "active" : ""}
              onClick={() => onShelfChange(tab)}
              key={tab}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <ProductGrid
        products={products}
        wished={wished}
        cart={cart}
        onWish={onWish}
        onAdd={onAdd}
        openProduct={openProduct}
        openCatalog={openCatalog}
      />
    </section>
  );
}
