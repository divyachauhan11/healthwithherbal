"use client";
import { ArrowRight } from "lucide-react";
import { StoryStat } from "./StoryStat";

/**
 * "Our promise" brand story band with headline figures.
 * @param {{openContent: (page: string) => void}} props
 */
export function StorySection({ openContent }) {
  return (
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
        <StoryStat value="23+" label="trusted heritage brands" />
        <StoryStat value="450+" label="plant-powered products" />
        <StoryStat value="60+" label="countries delivered to" />
      </div>
    </section>
  );
}
