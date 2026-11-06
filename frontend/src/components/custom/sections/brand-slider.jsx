"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SectionHeading } from "../../global/primitives";
import { listBrands } from "../../../lib/api";

export function BrandsSliderSection({ openCatalog, brands = [] }) {
  const [liveBrands, setLiveBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const trackRef = useRef(null);

  // If brands prop is empty or not yet loaded from store init, fetch directly from backend API
  useEffect(() => {
    if (brands && brands.length > 0) return;

    let active = true;
    setLoading(true);
    listBrands()
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data) && data.length > 0) {
          setLiveBrands(data);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch brands from backend:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [brands]);

  // Normalize brands strictly from the backend / database
  const displayedBrands = useMemo(() => {
    const source = brands && brands.length > 0 ? brands : liveBrands;
    if (!Array.isArray(source) || source.length === 0) return [];

    return source.map((b) => {
      const name = typeof b === "string" ? b : b?.name || "";
      const slug =
        typeof b === "object" && b?.slug
          ? b.slug
          : name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const rawLogo =
        typeof b === "object"
          ? b?.logoUrl || b?.image || (Array.isArray(b?.images) && b.images.length > 0 ? b.images[0] : "")
          : "";

      const logoUrl = typeof rawLogo === "string" ? rawLogo.trim() : "";

      return {
        _id: typeof b === "object" ? b?._id : slug,
        name,
        slug,
        logoUrl: logoUrl || "",
        description: typeof b === "object" ? b?.description || "" : "",
      };
    });
  }, [brands, liveBrands]);

  const slideLeft = () => {
    const el = trackRef.current || document.getElementById("brandTrack");
    if (el) el.scrollBy({ left: -280, behavior: "smooth" });
  };

  const slideRight = () => {
    const el = trackRef.current || document.getElementById("brandTrack");
    if (el) el.scrollBy({ left: 280, behavior: "smooth" });
  };

  // Duplicate for seamless infinite marquee loop
  const duplicated = useMemo(() => {
    if (displayedBrands.length === 0) return [];
    return [...displayedBrands, ...displayedBrands];
  }, [displayedBrands]);

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
          <div className="slider-controls">
            <button
              type="button"
              aria-label="Previous brands"
              onClick={slideLeft}
              title="Previous brands"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next brands"
              onClick={slideRight}
              title="Next brands"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="brand-marquee-viewport">
        <div className="brand-marquee-track" id="brandTrack" ref={trackRef}>
          {duplicated.map((brand, idx) => (
            <button
              type="button"
              key={`${brand.slug || brand.name}-${idx}`}
              className="brand-logo-only-card"
              onClick={() => {
                if (openCatalog) {
                  openCatalog("Brands", brand.name);
                } else if (typeof window !== "undefined") {
                  window.location.href = `/shop?brand=${encodeURIComponent(brand.name)}`;
                }
              }}
              title={`Explore products from ${brand.name}`}
            >
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="brand-logo-img"
                  onError={(e) => {
                    // Gracefully fallback to clean brand title badge if image fails
                    e.currentTarget.style.display = "none";
                    const fallbackEl = e.currentTarget.parentElement?.querySelector(
                      ".brand-fallback-monogram"
                    );
                    if (fallbackEl) {
                      fallbackEl.style.display = "flex";
                    }
                  }}
                />
              ) : null}

              <div
                className="brand-fallback-monogram"
                style={{ display: brand.logoUrl ? "none" : "flex" }}
              >
                <span className="brand-monogram-circle">
                  {brand.name.charAt(0).toUpperCase()}
                </span>
                <span className="brand-fallback-name">{brand.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
