"use client";
import { useState, useMemo } from "react";
import {
  ArrowRight,
  ChevronRight,
  Leaf,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import {
  AppButton,
  Rating,
  SectionHeading,
  ProductCard,
} from "@/components/pages/shared/primitives";
import { NewLaunchesSection } from "@/components/pages/sections/home/NewLaunches";
import { BrandsSliderSection } from "@/components/pages/sections/home/BrandSlider";
import { WhyHealthWithHerbal } from "@/components/pages/sections/home/WhySection";

export function HomePage({
  navigate,
  openCatalog,
  openContent,
  onAdd,
  cart,
  wished,
  onWish,
  openProduct,
  products = [],
  categories = [],
  navigationCategories = [],
  featuredCategoryIds = [],
  brands = [],
  coupons = [],
  blogs = [],
  reviews = [],
}) {
  const [shelf, setShelf] = useState("Latest");
  const activeProducts = products;

  const displayedConcerns = categories
    .filter((c) => c && c.type === "concern")
    .map((c) => (typeof c === "string" ? c : c.name));
  const featuredCategoryIdSet = new Set(featuredCategoryIds.map(String));
  const featuredCategories = navigationCategories
    .filter(
      (category) =>
        category &&
        category.isParent &&
        featuredCategoryIdSet.has(String(category._id || category.id)),
    )
    .slice(0, 4);
  const categoryTones = ["ochre", "green", "rose", "blue"];

  // High rating products in decreasing order for Our Bestsellers
  const bestsellerProducts = useMemo(() => {
    return [...activeProducts]
      .sort((a, b) => {
        const ratingDiff = (Number(b.rating) || 0) - (Number(a.rating) || 0);
        if (ratingDiff !== 0) return ratingDiff;
        const reviewDiff = (Number(b.reviews) || 0) - (Number(a.reviews) || 0);
        if (reviewDiff !== 0) return reviewDiff;
        return (a.title || "").localeCompare(b.title || "");
      })
      .slice(0, 4);
  }, [activeProducts]);

  const shelfProducts =
    shelf === "Top rated"
      ? [...activeProducts]
          .sort(
            (a, b) =>
              (Number(b.rating) || 0) - (Number(a.rating) || 0) ||
              (Number(b.reviews) || 0) - (Number(a.reviews) || 0),
          )
          .slice(0, 4)
      : shelf === "Featured"
        ? activeProducts.slice(0, 4)
        : activeProducts.slice(0, 4);
  return (
    <main>
      <section className="hero">
        <div className="hero-glow" />
        <div className="page-width hero-grid">
          <div className="hero-copy">
            <h1>
              Wellness, the way <em>nature</em> intended.
            </h1>
            <p>
              Discover authentic Ayurvedic remedies and herbal care,
              thoughtfully chosen for modern everyday rituals.
            </p>
            <div className="hero-actions">
              <AppButton
                variant="light"
                onClick={() => openCatalog("All Products")}
              >
                Explore all products <ArrowRight size={17} />
              </AppButton>
              <AppButton
                variant="ghost"
                onClick={() => openContent("Our Story")}
              >
                Our story
              </AppButton>
            </div>
            <div className="hero-proof">
              <div className="avatars">
                <span>SR</span>
                <span>MK</span>
                <span>AL</span>
              </div>
              <div>
                <Rating value={4.9} />
                <small>Loved by 25,000+ wellness seekers</small>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-main">
              <img
                src="https://images.unsplash.com/photo-1722933375700-e297a7996265?auto=format&fit=crop&w=1200&q=90"
                alt="Amber botanical oil in a glass bottle"
              />
            </div>
            <div className="hero-image-small">
              <img
                src="https://images.unsplash.com/photo-1683648955701-81015c80ff6f?auto=format&fit=crop&w=600&q=85"
                alt="Golden turmeric and botanical ingredients"
              />
            </div>
            <div className="hero-note">
              <span>
                <Leaf size={16} />
              </span>
              <p>
                <strong>100% botanical</strong>
                <small>Clean, conscious formulas</small>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="page-width">
          <div>
            <Truck />
            <span>
              <strong>Free delivery</strong>
              <small>On orders over ₹75</small>
            </span>
          </div>
          <div>
            <ShieldCheck />
            <span>
              <strong>30-day guarantee</strong>
              <small>Love it or return it</small>
            </span>
          </div>
          <div>
            <Leaf />
            <span>
              <strong>Authentic & natural</strong>
              <small>Carefully sourced</small>
            </span>
          </div>
          <div>
            <PackageCheck />
            <span>
              <strong>Securely packed</strong>
              <small>With earth-kind materials</small>
            </span>
          </div>
        </div>
      </section>

      <section className="section page-width">
        <SectionHeading
          eyebrow="Find your ritual"
          title="Wellness, curated by nature"
          copy="Explore time-honored care for every part of your day."
          centered
        />
        <div className="category-grid">
          {featuredCategories.map((category, index) => (
            <button
              type="button"
              className={`category-card ${categoryTones[index % categoryTones.length]}`}
              key={
                category._id || category.id || category.slug || category.name
              }
              onClick={() => openCatalog(category.name)}
            >
              <span className="category-letter">
                {category.name?.charAt(0)}
              </span>
              <span>
                <strong>{category.name}</strong>
                <small>
                  {category.description || "Explore this collection"}
                </small>
              </span>
              <ChevronRight />
            </button>
          ))}
        </div>
      </section>

      <section className="section soft-section">
        <div className="page-width">
          <div className="section-row">
            <SectionHeading
              eyebrow="Chosen for you"
              title="Our bestsellers"
              copy="Discover our most loved products"
            />
            <AppButton
              variant="outline"
              onClick={() => openCatalog("All Products")}
            >
              View all <ArrowRight size={16} />
            </AppButton>
          </div>
          <div className="products-grid">
            {bestsellerProducts.map((product) => (
              <ProductCard
                key={product.id || product._id}
                product={product}
                wished={wished.includes(product.id)}
                added={cart.includes(product.id)}
                onWish={() => onWish(product.id)}
                onAdd={() => onAdd(product.id)}
                onOpen={() => openProduct(product.id)}
                onSimilar={() =>
                  openCatalog(product.category || "All Products")
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* NEW LAUNCHES SECTION */}
      <NewLaunchesSection
        onAdd={onAdd}
        onWish={onWish}
        wished={wished}
        cart={cart}
        openProduct={openProduct}
        openCatalog={openCatalog}
        products={activeProducts}
      />

      {/* SUPPORT FOR THE WAY YOU FEEL */}
      {displayedConcerns.length > 0 && (
        <section className="section soft-section">
          <div className="page-width">
            <SectionHeading
              eyebrow="Shop your concern"
              title="Support for the way you feel"
              centered
            />
            <div className="concern-cloud">
              {displayedConcerns.map((concern) => (
                <button
                  type="button"
                  key={concern}
                  onClick={() => openCatalog("Shop by Concern", concern)}
                >
                  {concern}
                  <ArrowRight size={14} />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section story-section">
        <div className="page-width story-grid">
          <div>
            <span className="eyebrow light">Our promise</span>
            <h2>
              Old-world wisdom.
              <br />
              New-world standards.
            </h2>
          </div>
          <div>
            <p>
              We believe wellness should feel simple, honest and deeply
              personal. That is why every remedy in our collection is selected
              for ingredient integrity, traditional wisdom and transparent
              making.
            </p>
            <button
              type="button"
              className="text-link light"
              onClick={() => openContent("Our Story")}
            >
              Discover our story <ArrowRight size={16} />
            </button>
          </div>
          <div className="story-stat">
            <strong>23+</strong>
            <span>trusted heritage brands</span>
          </div>
          <div className="story-stat">
            <strong>450+</strong>
            <span>plant-powered products</span>
          </div>
          <div className="story-stat">
            <strong>60+</strong>
            <span>countries delivered to</span>
          </div>
        </div>
      </section>

      <section className="section page-width">
        <div className="section-row">
          <SectionHeading
            eyebrow="Discover more"
            title="Fresh from the herbal shelf"
          />
          <div className="tabs">
            {["Latest", "Top rated", "Featured"].map((tab) => (
              <button
                type="button"
                className={shelf === tab ? "active" : ""}
                onClick={() => setShelf(tab)}
                key={tab}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="products-grid">
          {shelfProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              wished={wished.includes(product.id)}
              added={cart.includes(product.id)}
              onWish={() => onWish(product.id)}
              onAdd={() => onAdd(product.id)}
              onOpen={() => openProduct(product.id)}
              onSimilar={() => openCatalog(product.category || "All Products")}
            />
          ))}
        </div>
      </section>

      {/* Brands We Trust Section */}
      <BrandsSliderSection openCatalog={openCatalog} brands={brands} />

      {/* Why Health with Herbal Section */}
      <WhyHealthWithHerbal />
    </main>
  );
}
