import { Star } from "lucide-react";

/**
 * Star rating value of a review.
 * @param {{rating: number}} props
 */
export function ReviewRating({ rating }) {
  return (
    <span className="rating">
      <Star size={12} fill="currentColor" /> {rating}
    </span>
  );
}
