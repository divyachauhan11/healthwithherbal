"use client";
import { SectionHeading } from "@/components/pages/shared/primitives";
import { CategoryCard } from "./CategoryCard";
import { CATEGORY_TONES } from "./home-utils";

/**
 * "Wellness, curated by nature" grid of featured categories.
 * @param {object} props
 * @param {Array<object>} props.categories Featured categories (up to four).
 * @param {(view: string) => void} props.openCatalog
 */
export function FeaturedCategories({ categories, openCatalog }) {
  return (
    <section className="section page-width">
      <SectionHeading
        eyebrow="Find your ritual"
        title="Wellness, curated by nature"
        copy="Explore time-honored care for every part of your day."
        centered
      />
      <div className="category-grid">
        {categories.map((category, index) => (
          <CategoryCard
            key={
              category._id || category.id || category.slug || category.name
            }
            category={category}
            tone={CATEGORY_TONES[index % CATEGORY_TONES.length]}
            onClick={() => openCatalog(category.name)}
          />
        ))}
      </div>
    </section>
  );
}
