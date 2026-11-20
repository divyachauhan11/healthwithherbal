"use client";
import { ChevronRight } from "lucide-react";

/**
 * Featured category card: initial letter, name and description.
 * @param {object} props
 * @param {{name: string, description?: string}} props.category
 * @param {string} props.tone Colour tone class ("ochre", "green", ...).
 * @param {() => void} props.onClick
 */
export function CategoryCard({ category, tone, onClick }) {
  return (
    <button
      type="button"
      className={`category-card ${tone}`}
      onClick={onClick}
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
  );
}
