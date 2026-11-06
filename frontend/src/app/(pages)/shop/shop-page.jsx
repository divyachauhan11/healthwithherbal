"use client";

import { useEffect, useState, useMemo } from "react";
import { ChevronDown, Leaf, X } from "lucide-react";
import { AppButton, ProductCard } from "../../../components/global/primitives";
import { fetchStoreInit, listProducts } from "../../../lib/api";

export function ShopPage({
  wished,
  cart,
  onWish,
  onAdd,
  openProduct,
  view,
  initialTerm,
  products: productsProp = [],
  categories: categoriesProp = [],
  brands: brandsProp = [],
}) {
  const [sort, setSort] = useState("Featured");
  const [term, setTerm] = useState(initialTerm || "");
  const [selectedFacet, setSelectedFacet] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedConcerns, setSelectedConcerns] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  // Live state synchronized with backend
  const [catalogProducts, setCatalogProducts] = useState(productsProp || []);
  const [catalogCategories, setCatalogCategories] = useState(categoriesProp || []);
  const [catalogBrands, setCatalogBrands] = useState(brandsProp || []);

  // Always fetch fresh backend catalog data on mount
  useEffect(() => {
    let active = true;
    fetchStoreInit()
      .then((data) => {
        if (!active || !data) return;
        if (Array.isArray(data.products)) {
          setCatalogProducts(data.products);
        }
        if (Array.isArray(data.categories)) {
          setCatalogCategories(data.categories);
        }
        if (Array.isArray(data.brands)) {
          setCatalogBrands(data.brands);
        }
      })
      .catch((err) => {
        console.warn("Could not load backend store init data:", err);
      });
    return () => {
      active = false;
    };
  }, []);

  // Sync state if props change from parent
  useEffect(() => {
    if (productsProp) setCatalogProducts(productsProp);
  }, [productsProp]);

  useEffect(() => {
    if (categoriesProp) setCatalogCategories(categoriesProp);
  }, [categoriesProp]);

  useEffect(() => {
    if (brandsProp) setCatalogBrands(brandsProp);
  }, [brandsProp]);

  const effectiveProducts =
    catalogProducts.length > 0 ? catalogProducts : (productsProp || []);

  const effectiveCategories =
    catalogCategories.length > 0 ? catalogCategories : (categoriesProp || []);

  const effectiveBrandsList =
    catalogBrands.length > 0 ? catalogBrands : (brandsProp || []);

  // Active Brands from backend
  const activeBrands = useMemo(() => {
    const list = effectiveBrandsList
      .map((b) => (typeof b === "string" ? b : b?.name || ""))
      .filter(Boolean);
    return Array.from(new Set(list)).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [effectiveBrandsList]);

  // Form / Product Category from backend (type === "form" or untyped)
  const activeAyurvedicSubs = useMemo(() => {
    const formCats = effectiveCategories
      .filter((c) => c && (c.type === "form" || !c.type))
      .map((c) => (typeof c === "string" ? c : c.name))
      .filter(Boolean);

    return Array.from(new Set(formCats)).sort((a, b) => a.localeCompare(b));
  }, [effectiveCategories]);

  // Health Concerns from backend (type === "concern")
  const activeConcernSubs = useMemo(() => {
    const concernCats = effectiveCategories
      .filter((c) => c && c.type === "concern")
      .map((c) => (typeof c === "string" ? c : c.name))
      .filter(Boolean);

    return Array.from(new Set(concernCats)).sort((a, b) => a.localeCompare(b));
  }, [effectiveCategories]);

  // Compute live product counts for all filters
  const filterCounts = useMemo(() => {
    const catMap = {};
    const concernMap = {};
    const brandMap = {};

    effectiveProducts.forEach((product) => {
      // Category count
      const cat = (product.category || "").toLowerCase().trim();
      if (cat) catMap[cat] = (catMap[cat] || 0) + 1;

      // Brand count
      const br = (product.brand || "").toLowerCase().trim();
      if (br) brandMap[br] = (brandMap[br] || 0) + 1;

      // Concern count
      const pText = `${product.title || ""} ${product.category || ""} ${product.description || ""}`.toLowerCase();
      activeConcernSubs.forEach((con) => {
        const cLower = con.toLowerCase().trim();
        if (pText.includes(cLower) || cat === cLower) {
          concernMap[cLower] = (concernMap[cLower] || 0) + 1;
        }
      });
    });

    return { catMap, concernMap, brandMap };
  }, [effectiveProducts, activeConcernSubs]);

  const content = useMemo(() => {
    const viewTitle = view || "All Products";
    return {
      eyebrow: "The Herbal Shelf",
      title: viewTitle,
      copy:
        view === "Brands"
          ? "Authentic herbal remedies from respected makers."
          : `Explore our collection of authentic ${viewTitle.toLowerCase()} remedies.`,
    };
  }, [view]);

  const filtered = effectiveProducts
    .filter((product) => {
      if (view === "Brands" && selectedFacet) {
        return (
          product.brand?.toLowerCase() === selectedFacet.toLowerCase()
        );
      }
      if (view === "Shop by Concern" && selectedFacet) {
        return `${product.title} ${product.category} ${product.description || ""}`
          .toLowerCase()
          .includes(selectedFacet.toLowerCase());
      }
      if (view && view !== "All Products" && view !== "Brands" && view !== "Shop by Concern") {
        const vLower = view.toLowerCase();
        return (
          product.category?.toLowerCase() === vLower ||
          product.brand?.toLowerCase() === vLower
        );
      }
      return true;
    })
    .filter((product) => {
      if (selectedCategories.length === 0) return true;
      return selectedCategories.some(
        (cat) => product.category?.toLowerCase() === cat.toLowerCase()
      );
    })
    .filter((product) => {
      if (selectedConcerns.length === 0) return true;
      return selectedConcerns.some((con) =>
        `${product.title} ${product.category} ${product.description || ""}`
          .toLowerCase()
          .includes(con.toLowerCase())
      );
    })
    .filter((product) => {
      if (selectedBrands.length === 0) return true;
      return selectedBrands.some(
        (b) => product.brand?.toLowerCase() === b.toLowerCase()
      );
    })
    .filter((product) =>
      `${product.title} ${product.brand} ${product.category} ${product.description || ""}`
        .toLowerCase()
        .includes(term.trim().toLowerCase())
    );

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };
  const toggleConcern = (con) => {
    setSelectedConcerns((prev) =>
      prev.includes(con) ? prev.filter((c) => c !== con) : [...prev, con]
    );
  };
  const toggleBrand = (b) => {
    setSelectedBrands((prev) =>
      prev.includes(b) ? prev.filter((item) => item !== b) : [...prev, b]
    );
  };

  const clearAllFilters = () => {
    setTerm("");
    setSelectedFacet("");
    setSelectedCategories([]);
    setSelectedConcerns([]);
    setSelectedBrands([]);
  };

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "Price: Low to high") return a.price - b.price;
    if (sort === "Top rated")
      return b.rating - a.rating || b.reviews - a.reviews;
    if (sort === "Newest") return b.id - a.id;
    return (
      Number(Boolean(b.badge)) - Number(Boolean(a.badge)) ||
      b.reviews - a.reviews
    );
  });

  return (
    <main className="shop-page page-width">
      <div className="shop-heading">
        <div>
          <span className="eyebrow">{content.eyebrow}</span>
          <h1>{content.title}</h1>
          <p>{content.copy}</p>
        </div>
        <div className="shop-count">{filtered.length} products</div>
      </div>

      {/* Top Brands Directory Pills */}
      {view === "Brands" && (
        <div className="brand-directory">
          {activeBrands.map((brand) => (
            <button
              type="button"
              className={selectedFacet === brand ? "active" : ""}
              key={brand}
              onClick={() => {
                setSelectedFacet(brand);
                setTerm(brand);
              }}
            >
              {brand}
            </button>
          ))}
        </div>
      )}

      {/* Top Concerns Directory Pills */}
      {view === "Shop by Concern" && (
        <div className="brand-directory concern-directory">
          {activeConcernSubs.map((concern) => (
            <button
              type="button"
              className={selectedFacet === concern ? "active" : ""}
              key={concern}
              onClick={() => {
                setSelectedFacet(concern);
                setTerm("");
              }}
            >
              {concern}
            </button>
          ))}
        </div>
      )}

      <div className="shop-layout">
        <aside className="filters">
          <div className="filter-title">
            Filters{" "}
            <button type="button" onClick={clearAllFilters}>
              Clear all
            </button>
          </div>

          <label>
            Search products
            <input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Try “Himalaya”"
            />
          </label>

          {/* Category Filter (All Form Categories from Backend) */}
          <details open>
            <summary>
              Category ({activeAyurvedicSubs.length}) <ChevronDown size={16} />
            </summary>
            <div className="filter-scrollable-list">
              {activeAyurvedicSubs.map((item) => {
                const count = filterCounts.catMap[item.toLowerCase().trim()] || 0;
                return (
                  <label className="checkline" key={item}>
                    <div className="checkline-label">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(item)}
                        onChange={() => toggleCategory(item)}
                      />
                      <span>{item}</span>
                    </div>
                    {count > 0 && <span className="filter-count">({count})</span>}
                  </label>
                );
              })}
            </div>
          </details>

          {/* Shop by concern Filter (All Concern Categories from Backend - Uncapped) */}
          <details open>
            <summary>
              Shop by concern ({activeConcernSubs.length}) <ChevronDown size={16} />
            </summary>
            <div className="filter-scrollable-list">
              {activeConcernSubs.map((item) => {
                const count = filterCounts.concernMap[item.toLowerCase().trim()] || 0;
                return (
                  <label className="checkline" key={item}>
                    <div className="checkline-label">
                      <input
                        type="checkbox"
                        checked={selectedConcerns.includes(item)}
                        onChange={() => toggleConcern(item)}
                      />
                      <span>{item}</span>
                    </div>
                    {count > 0 && <span className="filter-count">({count})</span>}
                  </label>
                );
              })}
            </div>
          </details>

          {/* Brand Filter (All Brands from Backend - Uncapped) */}
          <details open>
            <summary>
              Brand ({activeBrands.length}) <ChevronDown size={16} />
            </summary>
            <div className="filter-scrollable-list">
              {activeBrands.map((item) => {
                const count = filterCounts.brandMap[item.toLowerCase().trim()] || 0;
                return (
                  <label className="checkline" key={item}>
                    <div className="checkline-label">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(item)}
                        onChange={() => toggleBrand(item)}
                      />
                      <span>{item}</span>
                    </div>
                    {count > 0 && <span className="filter-count">({count})</span>}
                  </label>
                );
              })}
            </div>
          </details>
        </aside>

        <section className="shop-results">
          <div className="results-tools">
            <div className="active-filter">
              {term ? `Search: ${term}` : selectedFacet || content.title}{" "}
              {(term ||
                selectedFacet ||
                selectedCategories.length > 0 ||
                selectedConcerns.length > 0 ||
                selectedBrands.length > 0) && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  aria-label="Clear active filter"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <label>
              Sort by
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="Featured">Featured</option>
                <option value="Price: Low to high">Price: Low to high</option>
                <option value="Top rated">Top rated</option>
                <option value="Newest">Newest</option>
              </select>
            </label>
          </div>

          <div className="products-grid shop-products">
            {sorted.map((product) => (
              <ProductCard
                key={product.id || product._id}
                product={product}
                wished={wished.includes(product.id || product._id)}
                added={cart.includes(product.id || product._id)}
                onWish={() => onWish(product.id || product._id)}
                onAdd={() => onAdd(product.id || product._id)}
                onOpen={() => openProduct(product.id || product._id)}
              />
            ))}
            {!sorted.length && (
              <div className="empty-state">
                <Leaf size={40} />
                <h3>No remedies found</h3>
                <p>Try clearing filters or search with another herbal term.</p>
                <AppButton onClick={clearAllFilters}>Reset all filters</AppButton>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default ShopPage;
