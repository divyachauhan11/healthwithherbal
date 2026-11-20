"use client";
import { ArrowRight, Leaf } from "lucide-react";
import { AppButton, Rating } from "@/components/pages/shared/primitives";

/**
 * Home hero: headline, calls to action, social proof and botanical imagery.
 * @param {object} props
 * @param {(view: string) => void} props.openCatalog
 * @param {(page: string) => void} props.openContent
 */
export function HomeHero({ openCatalog, openContent }) {
  return (
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
  );
}
