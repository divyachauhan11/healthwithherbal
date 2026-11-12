"use client";
import { useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { AppButton, SectionHeading, ProductCard } from "../../global/primitives";

export function NewLaunchesSection({
  onAdd,
  onWish,
  wished,
  cart,
  openProduct,
  openCatalog,
  products = [],
}) {
  const [startIndex, setStartIndex] = useState(0);
  const activeProducts = products;

  const launchProducts = useMemo(() => {
    if (!activeProducts || activeProducts.length === 0) return [];

    const newItems = activeProducts.filter(
      (p) => p.badge && p.badge.toLowerCase().includes("new"),
    );
    return newItems.length > 0 ? newItems : activeProducts.slice(0, 6);
  }, [activeProducts]);

  if (launchProducts.length === 0) return null;

  const prevSlide = () => {
        setStartIndex((curr) => (curr > 0 ? curr - 1 : launchProducts.length - 1));
    };
    const nextSlide = () => {
        setStartIndex((curr) => (curr < launchProducts.length - 1 ? curr + 1 : 0));
    };
    const visibleItems = [
        ...launchProducts.slice(startIndex),
        ...launchProducts.slice(0, startIndex),
    ];
    return (<section className="section new-launches-section">
      <div className="page-width">
        <div className="section-row new-launches-heading-row">
          <SectionHeading eyebrow="FRESH RITUALS" title="New launches" copy="Discover our latest time-honored herbal remedies"/>
          <AppButton variant="outline" onClick={() => openCatalog("All Products")}>
            View all <ArrowRight size={16}/>
          </AppButton>
        </div>

        <div className="new-launches-wrapper">
          <button type="button" className="carousel-arrow prev" onClick={prevSlide} aria-label="Previous launches">
            <ChevronLeft size={20}/>
          </button>

          <div className="products-grid new-launches-grid">
            {visibleItems.slice(0, 4).map((product) => (<ProductCard key={product.id} product={product} wished={wished.includes(product.id)} added={cart.includes(product.id)} onWish={() => onWish(product.id)} onAdd={() => onAdd(product.id)} onOpen={() => openProduct(product.id)} onSimilar={() => openCatalog(product.category || "All Products")}/>))}
          </div>

          <button type="button" className="carousel-arrow next" onClick={nextSlide} aria-label="Next launches">
            <ChevronRight size={20}/>
          </button>
        </div>
      </div>
    </section>);
}
