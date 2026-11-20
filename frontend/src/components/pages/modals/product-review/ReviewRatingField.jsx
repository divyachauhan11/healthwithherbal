import { Star } from "lucide-react";
import { RATING_DESCRIPTIONS } from "./product-review-utils";

/**
 * Five-star rating selector with hover preview and a caption for the score.
 * @param {object} props
 * @param {number} props.rating Selected rating (1–5).
 * @param {number} props.hoverRating Star under the pointer (0 when none).
 * @param {(rating: number) => void} props.onRate Selects a rating.
 * @param {(rating: number) => void} props.onHover Sets the hovered star (0 on leave).
 */
export function ReviewRatingField({ rating, hoverRating, onRate, onHover }) {
  const currentScore = hoverRating || rating;

  return (
    <div className="review-field-group rating-group">
      <label className="field-label">Your Overall Rating</label>
      <div className="stars-selector-wrap">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-choice-btn ${star <= currentScore ? "filled" : ""}`}
            onClick={() => onRate(star)}
            onMouseEnter={() => onHover(star)}
            onMouseLeave={() => onHover(0)}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              size={28}
              fill={star <= currentScore ? "#f59e0b" : "transparent"}
              color={star <= currentScore ? "#f59e0b" : "#d1d5db"}
            />
          </button>
        ))}
      </div>
      <span className="rating-desc-text">
        {RATING_DESCRIPTIONS[currentScore] || ""}
      </span>
    </div>
  );
}
