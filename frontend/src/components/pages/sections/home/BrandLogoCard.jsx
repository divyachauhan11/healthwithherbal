"use client";

/**
 * Brand slider card: the brand logo, or a monogram and name when there is no
 * logo or it fails to load.
 * @param {object} props
 * @param {{name: string, logoUrl: string}} props.brand Normalised slider brand.
 * @param {(view: string, searchTerm?: string) => void} [props.openCatalog]
 *   Opens the brand's products; without it the card links to `/shop?brand=`.
 */
export function BrandLogoCard({ brand, openCatalog }) {
  return (
    <button
      type="button"
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
  );
}
