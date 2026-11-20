"use client";
import { Rating } from "@/components/pages/shared/primitives";
import { formatReviewDate } from "./product-utils";

/**
 * Customer review card: rating, date, title, comment and reviewer.
 * @param {object} props
 * @param {object} props.review
 * @param {string} props.productTitle Shown when the review has no product title.
 */
export function ProductReviewCard({ review: rev, productTitle }) {
  return (
    <div className="review-card-item">
      <div className="review-card-top">
        <Rating value={rev.rating || 5} />
        <span className="review-date">
          {formatReviewDate(rev.createdAt)}
        </span>
      </div>
      {rev.title && <h4 className="review-card-title">{rev.title}</h4>}
      <p className="review-card-comment">“{rev.comment}”</p>
      <div className="review-card-author">
        <span className="reviewer-avatar">
          {(rev.reviewerName || rev.userName || "V")[0].toUpperCase()}
        </span>
        <div>
          <strong>{rev.reviewerName || rev.userName || "Verified Buyer"}</strong>
          <small>Verified Buyer · {rev.productTitle || productTitle}</small>
        </div>
      </div>
    </div>
  );
}
