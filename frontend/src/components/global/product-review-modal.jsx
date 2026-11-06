"use client";

import { useState } from "react";
import { Star, X, CheckCircle2, AlertCircle, Package, Sparkles } from "lucide-react";
import { submitProductReview } from "../../lib/api";

const RATING_DESCRIPTIONS = {
  1: "Poor — Did not meet expectations",
  2: "Fair — Below expectations",
  3: "Good — Acceptable herbal quality",
  4: "Very Good — Satisfied with results",
  5: "Exceptional — Loved the benefits & purity! 🌿",
};

export function ProductReviewModal({
  isOpen,
  onClose,
  product,
  order,
  currentUser,
  onSubmitted,
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState(
    currentUser?.name ||
      (order?.customer
        ? `${order.customer.firstName || ""} ${order.customer.lastName || ""}`.trim()
        : "") ||
      "",
  );
  const [userEmail, setUserEmail] = useState(
    currentUser?.email || order?.customer?.email || "",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen || !product) return null;

  const currentScore = hoverRating || rating;
  const productTitle = product.title || product.name || "Herbal Product";
  const brandName = product.brand || "Health with Herbal";
  const orderNumber = order?.orderNumber || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError("Please write a few words about your experience with this product.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      await submitProductReview({
        productId: product.product || product._id || product.id,
        legacyId: product.legacyId,
        productTitle,
        userId: currentUser?._id || order?.userId || null,
        userName: userName.trim() || "Verified Buyer",
        userEmail: userEmail.trim().toLowerCase(),
        orderNumber,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });

      setSuccess(true);
      onSubmitted?.();
    } catch (err) {
      setError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleClose = () => {
    if (!busy) {
      setError("");
      setSuccess(false);
      onClose();
    }
  };

  return (
    <div className="product-review-modal-backdrop" onClick={handleClose}>
      <div
        className="product-review-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
      >
        <button
          type="button"
          className="review-modal-close"
          onClick={handleClose}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {success ? (
          <div className="review-modal-success">
            <div className="success-icon-wrap">
              <CheckCircle2 size={54} color="#059669" />
            </div>
            <h3>Thank You for Your Feedback!</h3>
            <p className="success-copy">
              Your verified review for <strong>{productTitle}</strong> has been received! Our moderation team will verify it and publish it to the storefront shortly.
            </p>
            <button
              type="button"
              className="review-modal-done-btn"
              onClick={handleClose}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="review-modal-form">
            <div className="review-modal-header">
              <div className="review-product-preview">
                <div className="preview-icon-box">
                  <Package size={22} color="var(--forest)" />
                </div>
                <div>
                  <span className="preview-brand">{brandName}</span>
                  <h3 id="review-modal-title" className="preview-title">
                    {productTitle}
                  </h3>
                  {orderNumber && (
                    <span className="preview-order-ref">
                      Order #{orderNumber} • Delivered
                    </span>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="review-modal-alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Star Rating Selector */}
            <div className="review-field-group rating-group">
              <label className="field-label">Your Overall Rating</label>
              <div className="stars-selector-wrap">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-choice-btn ${star <= currentScore ? "filled" : ""}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
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

            {/* Review Headline */}
            <div className="review-field-group">
              <label className="field-label" htmlFor="review-headline">
                Review Title <span className="optional">(optional)</span>
              </label>
              <input
                id="review-headline"
                type="text"
                className="review-input"
                placeholder="e.g. Authentic herbs, noticed results in one week!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>

            {/* Review Comment */}
            <div className="review-field-group">
              <label className="field-label" htmlFor="review-body">
                Detailed Experience <span className="required">*</span>
              </label>
              <textarea
                id="review-body"
                className="review-textarea"
                rows={4}
                placeholder="What did you like or dislike? How did you consume this product? How did it help your wellness routine?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                maxLength={2000}
              />
            </div>

            {/* Reviewer Info */}
            <div className="review-form-row">
              <div className="review-field-group">
                <label className="field-label" htmlFor="reviewer-name">
                  Your Display Name
                </label>
                <input
                  id="reviewer-name"
                  type="text"
                  className="review-input"
                  placeholder="e.g. Priya S."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>

              <div className="review-field-group">
                <label className="field-label" htmlFor="reviewer-email">
                  Email Address
                </label>
                <input
                  id="reviewer-email"
                  type="email"
                  className="review-input"
                  placeholder="name@example.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <p className="review-moderation-note">
              <Sparkles size={13} color="var(--forest)" />
              All reviews are verified by our apothecary team to protect our community against automated spam before going live.
            </p>

            <div className="review-modal-actions">
              <button
                type="button"
                className="review-cancel-btn"
                onClick={handleClose}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="review-submit-btn"
                disabled={busy}
              >
                {busy ? "Submitting..." : "Submit Review for Approval"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
