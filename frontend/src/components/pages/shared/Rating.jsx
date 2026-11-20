"use client";
import { Star } from "lucide-react";

/**
 * Star rating with one decimal ("0.0" when unrated) and an optional review count.
 * @param {object} props
 * @param {number|string} props.value Average rating out of 5.
 * @param {number|string} [props.reviews] Review count; shown when provided.
 */
export function Rating({ value, reviews }) {
  const numVal = Number(value) || 0;
  const numReviews =
    reviews !== undefined && reviews !== null ? Number(reviews) : undefined;

  return (
    <div
      className={`rating ${numVal > 0 ? "has-rating" : "no-rating"}`}
      aria-label={`${numVal > 0 ? numVal.toFixed(1) : 0} out of 5 stars`}
    >
      <Star
        size={14}
        fill={numVal > 0 ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.8}
      />
      <span>{numVal > 0 ? numVal.toFixed(1) : "0.0"}</span>
      {numReviews !== undefined && !isNaN(numReviews) && (
        <small className="reviews-count">({numReviews})</small>
      )}
    </div>
  );
}
