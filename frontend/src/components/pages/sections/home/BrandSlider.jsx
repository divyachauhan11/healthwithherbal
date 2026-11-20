"use client";

import { SectionHeading } from "../../shared/primitives";
import { BrandLogoCard } from "./BrandLogoCard";
import { useSliderBrands } from "./useSliderBrands";

/**
 * "Brands we trust" infinite marquee of brand logos; renders nothing when
 * there are no brands (and none are loading).
 * @param {object} props
 * @param {(view: string, searchTerm?: string) => void} [props.openCatalog]
 * @param {Array<string|object>} [props.brands]
 */
export function BrandsSliderSection({ openCatalog, brands = [] }) {
  const { displayedBrands, duplicated, loading } = useSliderBrands(brands);

  if (displayedBrands.length === 0 && !loading) {
    return null;
  }

  return (
    <section className="brand-slider-section">
      <div className="page-width">
        <div className="brand-header-flex">
          <SectionHeading
            eyebrow="Heritage makers"
            title="Brands we trust"
            copy="Authentic care from respected herbal and Ayurvedic houses."
          />
        </div>
      </div>

      <div className="brand-marquee-viewport">
        <div className="brand-marquee-track">
          {duplicated.map((brand, idx) => (
            <BrandLogoCard
              key={`${brand.slug || brand.name}-${idx}`}
              brand={brand}
              openCatalog={openCatalog}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
