"use client";
import { SectionHeading } from "../../shared/primitives";
import { ProductGrid } from "../../shared/ProductGrid";
import { CarouselArrow } from "./CarouselArrow";
import { ViewAllButton } from "./ViewAllButton";
import { useNewLaunches } from "./useNewLaunches";

/**
 * "New launches" carousel showing four launch products at a time; renders
 * nothing when there are no products.
 * @param {object} props
 * @param {(id: string|number) => void} props.onAdd
 * @param {(id: string|number) => void} props.onWish
 * @param {Array<string|number>} props.wished
 * @param {Array<string|number>} props.cart
 * @param {(id: string|number) => void} props.openProduct
 * @param {(view: string) => void} props.openCatalog
 * @param {Array<object>} [props.products]
 */
export function NewLaunchesSection({
  onAdd,
  onWish,
  wished,
  cart,
  openProduct,
  openCatalog,
  products = [],
}) {
  const { launchProducts, visibleItems, prevSlide, nextSlide } = useNewLaunches(products);

  if (launchProducts.length === 0) return null;

  return (
    <section className="section new-launches-section">
      <div className="page-width">
        <div className="section-row new-launches-heading-row">
          <SectionHeading eyebrow="FRESH RITUALS" title="New launches" copy="Discover our latest time-honored herbal remedies"/>
          <ViewAllButton onClick={() => openCatalog("All Products")} />
        </div>

        <div className="new-launches-wrapper">
          <CarouselArrow direction="prev" label="Previous launches" onClick={prevSlide} />

          <ProductGrid
            className="new-launches-grid"
            products={visibleItems.slice(0, 4)}
            wished={wished}
            cart={cart}
            onWish={onWish}
            onAdd={onAdd}
            openProduct={openProduct}
            openCatalog={openCatalog}
          />

          <CarouselArrow direction="next" label="Next launches" onClick={nextSlide} />
        </div>
      </div>
    </section>
  );
}
