"use client";
import { Sparkles } from "lucide-react";
import { Rating, SectionHeading } from "@/components/pages/shared/primitives";
import { ProductReviewCard } from "./ProductReviewCard";

/**
 * "Customer Reviews & Ratings" section: rating summary and review cards, or
 * an empty state inviting the first review.
 * @param {object} props
 * @param {object} props.product
 * @param {Array<object>} props.reviews The product's reviews.
 * @param {number} props.rating Average rating.
 * @param {number} props.reviewsCount
 */
export function ProductReviewsSection({ product, reviews, rating, reviewsCount }) {
  return (
    <section className="product-reviews-section">
      <div className="section-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <SectionHeading
          eyebrow="Real feedback"
          title="Customer Reviews & Ratings"
          copy="Authentic experiences from verified wellness seekers who used this herbal remedy."
        />
        <div className="reviews-summary-badge">
          <Rating value={rating} reviews={reviewsCount} />
          <span>
            {reviewsCount > 0
              ? `${rating.toFixed(1)} / 5 Rating`
              : "No ratings yet"}
          </span>
        </div>
      </div>

      {reviews.length > 0 ? (
        <div className="reviews-cards-grid">
          {reviews.map((rev, idx) => (
            <ProductReviewCard key={rev._id || idx} review={rev} productTitle={product.title} />
          ))}
        </div>
      ) : (
        <div
          className="empty-reviews-box"
          style={{
            padding: "36px 20px",
            textAlign: "center",
            background: "#fbf8f3",
            border: "1px dashed rgba(29, 58, 43, 0.2)",
            borderRadius: "14px",
            marginTop: "24px",
          }}
        >
          <Sparkles size={26} color="var(--forest, #1d3a2b)" style={{ marginBottom: "8px", opacity: 0.8 }} />
          <h4 style={{ margin: "0 0 6px", fontSize: "16px", color: "var(--forest, #1d3a2b)", fontFamily: "var(--font-serif, serif)" }}>
            No reviews yet for {product.title}
          </h4>
          <p style={{ margin: "0 auto", maxWidth: "460px", color: "#666", fontSize: "14px", lineHeight: "1.5" }}>
            Be the first to share your honest herbal experience! After your order arrives, you can write a verified review directly from your delivered order receipt.
          </p>
        </div>
      )}
    </section>
  );
}
