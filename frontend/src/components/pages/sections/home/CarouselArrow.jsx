"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Previous/next arrow button of a product carousel.
 * @param {object} props
 * @param {"prev"|"next"} props.direction
 * @param {string} props.label Accessible name.
 * @param {() => void} props.onClick
 */
export function CarouselArrow({ direction, label, onClick }) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button type="button" className={`carousel-arrow ${direction}`} onClick={onClick} aria-label={label}>
      <Icon size={20}/>
    </button>
  );
}
